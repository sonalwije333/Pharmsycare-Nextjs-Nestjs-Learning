import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto';
import { Withdraw } from './entities/withdraw.entity';
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto';
import { Shop } from '../shops/entites/shop.entity';
import { WithdrawStatus } from '../../common/enums/enums';
import { paginate } from '../common/pagination/paginate';

@Injectable()
export class WithdrawsService {
    constructor(
        @InjectRepository(Withdraw)
        private readonly withdrawRepository: Repository<Withdraw>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
    ) {}

    async create(createWithdrawDto: CreateWithdrawDto): Promise<Withdraw> {
        // Check if shop exists
        const shop = await this.shopRepository.findOne({
            where: { id: createWithdrawDto.shop_id },
        });

        if (!shop) {
            throw new NotFoundException(
                `Shop with ID ${createWithdrawDto.shop_id} not found`,
            );
        }

        const withdraw = this.withdrawRepository.create({
            ...createWithdrawDto,
            status: WithdrawStatus.PENDING,
            shop,
        });

        return await this.withdrawRepository.save(withdraw);
    }

    async getWithdraws(getWithdrawsDto: GetWithdrawsDto): Promise<WithdrawPaginator> {
        const {
            limit,
            page,
            status,
            shop_id,
            orderBy,
            sortedBy,
            search,
            text,
        } = getWithdrawsDto;

        const pageNum = page ?? 1;
        const limitNum = limit ?? 10;
        const skip = (pageNum - 1) * limitNum;
        const take = limitNum;

        // Build where conditions
        const where: any = {};

        if (status) where.status = status;
        if (shop_id) where.shop_id = shop_id;
        if (text) where.note = ILike(`%${text}%`);

        if (search) {
            const searchParams = search.split(';');
            for (const searchParam of searchParams) {
                const [key, value] = searchParam.split(':');
                if (key && value) {
                    if (key === 'payment_method' || key === 'note') {
                        where[key] = ILike(`%${value}%`);
                    }
                }
            }
        }

        // Build order
        let order: any = { created_at: 'DESC' };
        if (orderBy && sortedBy) {
            order = {};
            order[orderBy] = sortedBy.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        }

        const [data, total] = await this.withdrawRepository.findAndCount({
            where,
            relations: ['shop'],
            skip,
            take,
            order,
        });

        const url = `/withdraws?limit=${limitNum}&page=${pageNum}`;

        return {
            data,
            ...paginate(total, pageNum, limitNum, data.length, url),
        };
    }

    async findOne(id: number): Promise<Withdraw> {
        const withdraw = await this.withdrawRepository.findOne({
            where: { id },
            relations: ['shop'],
        });

        if (!withdraw) {
            throw new NotFoundException(`Withdraw with ID ${id} not found`);
        }

        return withdraw;
    }

    async update(id: number, approveWithdrawDto: ApproveWithdrawDto): Promise<Withdraw> {
        const withdraw = await this.findOne(id);

        if (approveWithdrawDto.status) {
            withdraw.status = approveWithdrawDto.status;
        }

        return this.withdrawRepository.save(withdraw);
    }

    async remove(id: number): Promise<void> {
        const withdraw = await this.findOne(id);
        await this.withdrawRepository.remove(withdraw);
    }

    async getShopWithdraws(
        shopId: number,
        getWithdrawsDto: GetWithdrawsDto,
    ): Promise<WithdrawPaginator> {
        return this.getWithdraws({
            ...getWithdrawsDto,
            shop_id: shopId,
        });
    }

    async getTotalWithdrawAmount(shopId?: number): Promise<number> {
        const queryBuilder = this.withdrawRepository
            .createQueryBuilder('withdraw')
            .select('SUM(withdraw.amount)', 'total')
            .where('withdraw.status = :status', { status: WithdrawStatus.APPROVED });

        if (shopId) {
            queryBuilder.andWhere('withdraw.shop_id = :shopId', { shopId });
        }

        const result = await queryBuilder.getRawOne();
        return parseFloat(result.total) || 0;
    }

    async getPendingWithdrawsCount(shopId?: number): Promise<number> {
        const where: any = { status: WithdrawStatus.PENDING };
        if (shopId) where.shop_id = shopId;

        return this.withdrawRepository.count({ where });
    }

    async bulkUpdateStatus(
        ids: number[],
        status: WithdrawStatus,
        note?: string,
    ): Promise<Withdraw[]> {
        const withdraws = await this.withdrawRepository.findByIds(ids);

        if (withdraws.length === 0) {
            throw new NotFoundException('No withdraws found with the provided IDs');
        }

        for (const withdraw of withdraws) {
            withdraw.status = status;
            if (note) {
                withdraw.note = note;
            }
        }

        return this.withdrawRepository.save(withdraws);
    }
}
