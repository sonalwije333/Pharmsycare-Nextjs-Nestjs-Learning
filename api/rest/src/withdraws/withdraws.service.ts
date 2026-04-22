// src/withdraws/withdraws.service.ts
import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { ApproveWithdrawDto, ApproveWithdrawStatusMap } from './dto/approve-withdraw.dto';
import { Withdraw, WithdrawStatus } from './entities/withdraw.entity';
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto';
import { paginate } from 'src/common/pagination/paginate';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Permission } from 'src/common/enums/enums';

@Injectable()
export class WithdrawsService {
  constructor(
    @InjectRepository(Withdraw)
    private withdrawsRepository: Repository<Withdraw>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
  ) {}

  async create(
    createWithdrawDto: CreateWithdrawDto, 
    userId: number
  ): Promise<Withdraw> {
    // Verify shop exists and user owns it
    const shop = await this.shopsRepository.findOne({
      where: { id: createWithdrawDto.shop_id },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (shop.owner_id !== userId) {
      throw new ForbiddenException('You do not own this shop');
    }

    // Check shop balance
    const currentBalance = shop.balance?.current_balance || 0;
    if (createWithdrawDto.amount > currentBalance) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${currentBalance}, Requested: ${createWithdrawDto.amount}`
      );
    }

    // Check for pending withdrawals
    const pendingWithdraw = await this.withdrawsRepository.findOne({
      where: { 
        shop_id: createWithdrawDto.shop_id, 
        status: WithdrawStatus.PENDING 
      },
    });

    if (pendingWithdraw) {
      throw new BadRequestException('You already have a pending withdrawal request');
    }

    const withdraw = this.withdrawsRepository.create({
      ...createWithdrawDto,
      status: WithdrawStatus.PENDING,
    });

    const savedWithdraw = await this.withdrawsRepository.save(withdraw);

    // Update shop balance (reserve the amount)
    if (shop.balance) {
      shop.balance.current_balance -= createWithdrawDto.amount;
      shop.balance.withdrawn_amount = (shop.balance.withdrawn_amount || 0) + createWithdrawDto.amount;
      await this.shopsRepository.save(shop);
    }

    return savedWithdraw;
  }

  async getWithdraws(
    query: GetWithdrawsDto,
    user: any
  ): Promise<WithdrawPaginator> {
    const { 
      limit = 15, 
      page = 1, 
      status, 
      shop_id,
      orderBy = 'created_at', 
      sortedBy = 'DESC' 
    } = query;

    const queryBuilder = this.withdrawsRepository
      .createQueryBuilder('withdraw')
      .leftJoinAndSelect('withdraw.shop', 'shop');

    // Non-admin users can only see their own shop withdrawals
    if (!user.permissions?.includes(Permission.SUPER_ADMIN)) {
      if (shop_id) {
        // Verify user owns the shop
        const shop = await this.shopsRepository.findOne({ 
          where: { id: shop_id, owner_id: user.id } 
        });
        if (!shop) {
          throw new ForbiddenException('You do not own this shop');
        }
        queryBuilder.andWhere('withdraw.shop_id = :shop_id', { shop_id });
      } else {
        // Get all shops owned by user
        const userShops = await this.shopsRepository.find({ 
          where: { owner_id: user.id } 
        });
        const shopIds = userShops.map(s => s.id);
        if (shopIds.length > 0) {
          queryBuilder.andWhere('withdraw.shop_id IN (:...shopIds)', { shopIds });
        } else {
          return { data: [], ...paginate(0, page, limit, 0, '/withdraws') };
        }
      }
    } else if (shop_id) {
      queryBuilder.andWhere('withdraw.shop_id = :shop_id', { shop_id });
    }

    if (status) {
      queryBuilder.andWhere('withdraw.status = :status', { status });
    }

    const sortField = orderBy;
    const sortDirection = sortedBy.toUpperCase() as 'ASC' | 'DESC';
    queryBuilder.orderBy(`withdraw.${sortField}`, sortDirection);

    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/withdraws?limit=${limit}`;

    return {
      data: results,
      ...paginate(total, page, limit, results.length, url),
    };
  }

  async getMyWithdraws(
    query: GetWithdrawsDto,
    userId: number
  ): Promise<WithdrawPaginator> {
    const userShops = await this.shopsRepository.find({ 
      where: { owner_id: userId } 
    });
    const shopIds = userShops.map(s => s.id);

    if (shopIds.length === 0) {
      return { 
        data: [], 
        ...paginate(0, query.page || 1, query.limit || 15, 0, '/withdraws/my-withdraws') 
      };
    }

    return this.getWithdraws(query, { id: userId, permissions: [] });
  }

  async findOne(id: number, user?: any): Promise<Withdraw> {
    const withdraw = await this.withdrawsRepository.findOne({
      where: { id },
      relations: ['shop'],
    });

    if (!withdraw) {
      throw new NotFoundException(`Withdraw with ID ${id} not found`);
    }

    // Check permission
    if (user && !user.permissions?.includes(Permission.SUPER_ADMIN)) {
      const shop = await this.shopsRepository.findOne({
        where: { id: withdraw.shop_id, owner_id: user.id }
      });
      if (!shop) {
        throw new ForbiddenException('You are not authorized to view this withdrawal');
      }
    }

    return withdraw;
  }

  async approveWithdraw(
    id: number, 
    updateWithdrawDto: ApproveWithdrawDto
  ): Promise<Withdraw> {
    const withdraw = await this.findOne(id);
    const currentStatus = String(withdraw.status)
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');

    const normalizedStatus = updateWithdrawDto.status
      ? ApproveWithdrawStatusMap[updateWithdrawDto.status]
      : WithdrawStatus.APPROVED;

    if (!normalizedStatus) {
      throw new BadRequestException('Invalid withdrawal status');
    }

    if (currentStatus === 'rejected' && normalizedStatus !== WithdrawStatus.REJECTED) {
      const shop = await this.shopsRepository.findOne({
        where: { id: withdraw.shop_id },
      });

      if (shop?.balance) {
        if (shop.balance.current_balance < withdraw.amount) {
          throw new BadRequestException('Insufficient shop balance to restore this withdrawal');
        }

        shop.balance.current_balance -= withdraw.amount;
        shop.balance.withdrawn_amount = (shop.balance.withdrawn_amount || 0) + withdraw.amount;
        await this.shopsRepository.save(shop);
      }
    }

    if (currentStatus !== 'rejected' && normalizedStatus === WithdrawStatus.REJECTED) {
      const shop = await this.shopsRepository.findOne({
        where: { id: withdraw.shop_id },
      });

      if (shop?.balance) {
        shop.balance.current_balance += withdraw.amount;
        shop.balance.withdrawn_amount = Math.max((shop.balance.withdrawn_amount || 0) - withdraw.amount, 0);
        await this.shopsRepository.save(shop);
      }
    }

    withdraw.status = normalizedStatus;
    return this.withdrawsRepository.save(withdraw);
  }

  async rejectWithdraw(id: number): Promise<Withdraw> {
    const withdraw = await this.findOne(id);

    return this.approveWithdraw(withdraw.id, { status: 'rejected' });
  }

  async processWithdraw(id: number): Promise<Withdraw> {
    const withdraw = await this.findOne(id);
    
    if (withdraw.status !== WithdrawStatus.APPROVED) {
      throw new BadRequestException('Only approved withdrawals can be processed');
    }

    withdraw.status = WithdrawStatus.PROCESSING;
    return this.withdrawsRepository.save(withdraw);
  }

  async remove(id: number, user?: any): Promise<CoreMutationOutput> {
    const withdraw = await this.findOne(id);

    // Check permission
    if (user && !user.permissions?.includes(Permission.SUPER_ADMIN)) {
      const shop = await this.shopsRepository.findOne({
        where: { id: withdraw.shop_id, owner_id: user.id }
      });
      if (!shop) {
        throw new ForbiddenException('You are not authorized to delete this withdrawal');
      }
    }

    if (withdraw.status !== WithdrawStatus.PENDING) {
      throw new BadRequestException('Only pending withdrawals can be deleted');
    }

    // Return amount to shop balance
    const shop = await this.shopsRepository.findOne({ 
      where: { id: withdraw.shop_id } 
    });
    if (shop?.balance) {
      shop.balance.current_balance += withdraw.amount;
      shop.balance.withdrawn_amount -= withdraw.amount;
      await this.shopsRepository.save(shop);
    }

    await this.withdrawsRepository.remove(withdraw);
    
    return {
      success: true,
      message: 'Withdrawal deleted successfully',
    };
  }

  async getStats(): Promise<any> {
    const stats = await this.withdrawsRepository
      .createQueryBuilder('withdraw')
      .select('withdraw.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdraw.amount)', 'totalAmount')
      .groupBy('withdraw.status')
      .getRawMany();

    const totalWithdraws = stats.reduce((sum, s) => sum + parseInt(s.count), 0);
    const totalAmount = stats.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0);

    const statusMap: any = {};
    stats.forEach(s => {
      statusMap[`${s.status.toLowerCase()}Count`] = parseInt(s.count);
      statusMap[`${s.status.toLowerCase()}Amount`] = parseFloat(s.totalAmount || 0);
    });

    return {
      totalWithdraws,
      totalAmount,
      pendingCount: statusMap.pendingCount || 0,
      pendingAmount: statusMap.pendingAmount || 0,
      approvedCount: statusMap.approvedCount || 0,
      approvedAmount: statusMap.approvedAmount || 0,
      processingCount: statusMap.processingCount || 0,
      processingAmount: statusMap.processingAmount || 0,
      rejectedCount: statusMap.rejectedCount || 0,
      rejectedAmount: statusMap.rejectedAmount || 0,
    };
  }
}