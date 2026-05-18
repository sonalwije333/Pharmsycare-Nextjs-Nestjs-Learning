import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateOwnershipTransferDto } from './dto/create-ownership-transfer.dto';
import { OwnershipTransfer } from './entities/ownership-transfer.entity';
import { GetOwnershipTransferDto, OwnershipTransferPaginator } from './dto/get-ownership-transfer.dto';
import { UpdateOwnershipTransferDto } from './dto/update-ownership-transfer.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/enums/enums';
import { OwnershipTransferOrderByColumn, OwnershipTransferStatus } from 'src/common/enums/ownership-transfer.enum';

@Injectable()
export class OwnershipTransferService {
  constructor(
    @InjectRepository(OwnershipTransfer)
    private readonly ownershipTransferRepository: Repository<OwnershipTransfer>,
  ) {}

  async create(createDto: CreateOwnershipTransferDto): Promise<OwnershipTransfer> {
    const transactionIdentifier = await this.getUniqueTransactionIdentifier(
      createDto.transaction_identifier,
    );

    const newTransfer = this.ownershipTransferRepository.create({
      transaction_identifier: transactionIdentifier,
      previous_owner_id: createDto.previous_owner_id,
      current_owner_id: createDto.current_owner_id,
      message: createDto.message,
      created_by: createDto.created_by?.toString() || '1',
      status: createDto.status || OwnershipTransferStatus.PENDING,
    });

    return this.ownershipTransferRepository.save(newTransfer);
  }

  async findAll({
    page = 1,
    limit = 30,
    search,
    status,
    previous_owner_id,
    current_owner_id,
    orderBy = OwnershipTransferOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetOwnershipTransferDto): Promise<OwnershipTransferPaginator> {
    const query = this.ownershipTransferRepository.createQueryBuilder('ownershipTransfer');

    if (status) {
      query.andWhere('ownershipTransfer.status = :status', { status });
    }

    if (previous_owner_id) {
      query.andWhere('ownershipTransfer.previous_owner_id = :previous_owner_id', {
        previous_owner_id,
      });
    }

    if (current_owner_id) {
      query.andWhere('ownershipTransfer.current_owner_id = :current_owner_id', {
        current_owner_id,
      });
    }

    if (search) {
      query.andWhere(
        '(LOWER(ownershipTransfer.transaction_identifier) LIKE :search OR LOWER(ownershipTransfer.status) LIKE :search OR LOWER(COALESCE(ownershipTransfer.message, \'\')) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case OwnershipTransferOrderByColumn.TRANSACTION_IDENTIFIER:
        orderColumn = 'transaction_identifier';
        break;
      case OwnershipTransferOrderByColumn.STATUS:
        orderColumn = 'status';
        break;
      case OwnershipTransferOrderByColumn.UPDATED_AT:
        orderColumn = 'updated_at';
        break;
      default:
        orderColumn = 'created_at';
    }

      query.orderBy(
        `ownershipTransfer.${orderColumn}`,
        sortedBy === SortOrder.ASC ? 'ASC' : 'DESC',
      );

      const safePage = Number(page) || 1;
      const safeLimit = Number(limit) || 30;
      const [results, total] = await query
        .skip((safePage - 1) * safeLimit)
        .take(safeLimit)
        .getManyAndCount();

      const url = `/ownership-transfer?limit=${safeLimit}`;
      const paginationInfo = paginate(total, safePage, safeLimit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
        current_page: safePage,
        per_page: safeLimit,
      total,
        last_page: Math.ceil(total / safeLimit),
        from: total === 0 ? 0 : (safePage - 1) * safeLimit + 1,
        to: Math.min(safePage * safeLimit, total),
    };
  }

  async findOne(param: string): Promise<OwnershipTransfer> {
    const isId = !isNaN(Number(param));
      const transfer = await this.ownershipTransferRepository.findOne({
        where: isId ? { id: Number(param) } : { transaction_identifier: param },
      });
    
    if (!transfer) {
      throw new NotFoundException(`Ownership transfer with ${isId ? 'ID' : 'identifier'} "${param}" not found`);
    }
    
    return transfer;
  }

  async update(id: number, updateDto: UpdateOwnershipTransferDto): Promise<OwnershipTransfer> {
    const transfer = await this.ownershipTransferRepository.findOne({ where: { id } });

    if (!transfer) {
      throw new NotFoundException(`Ownership transfer with ID ${id} not found`);
    }

    const updated = this.ownershipTransferRepository.merge(transfer, {
      ...updateDto,
      created_by:
        updateDto.created_by !== undefined
          ? updateDto.created_by.toString()
          : transfer.created_by,
    });

    return this.ownershipTransferRepository.save(updated);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const transfer = await this.ownershipTransferRepository.findOne({ where: { id } });

    if (!transfer) {
      throw new NotFoundException(`Ownership transfer with ID ${id} not found`);
    }

    await this.ownershipTransferRepository.delete(id);
    
    return {
      success: true,
      message: `Ownership transfer #${id} removed successfully`,
    };
  }

  private async generateTransactionIdentifier(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const prefix = `${year}-${month}-${day}-`;
    const sequence = String(
      (await this.ownershipTransferRepository.count({
        where: { transaction_identifier: Like(`${prefix}%`) },
      })) + 1,
    ).padStart(4, '0');
    return `${prefix}${sequence}`;
  }

  private async getUniqueTransactionIdentifier(preferredIdentifier?: string): Promise<string> {
    const hasUniquePreferredIdentifier = preferredIdentifier
      ? !(await this.ownershipTransferRepository.exist({
          where: { transaction_identifier: preferredIdentifier },
        }))
      : false;

    if (hasUniquePreferredIdentifier) {
      return preferredIdentifier as string;
    }

    let generatedIdentifier = await this.generateTransactionIdentifier();
    while (
      await this.ownershipTransferRepository.exist({
        where: { transaction_identifier: generatedIdentifier },
      })
    ) {
      generatedIdentifier = await this.generateTransactionIdentifier();
    }

    return generatedIdentifier;
  }

  // Helper method to get by previous owner
  async findByPreviousOwner(previousOwnerId: number): Promise<OwnershipTransfer[]> {
    return this.ownershipTransferRepository.find({
      where: { previous_owner_id: previousOwnerId },
    });
  }

  // Helper method to get by current owner
  async findByCurrentOwner(currentOwnerId: number): Promise<OwnershipTransfer[]> {
    return this.ownershipTransferRepository.find({
      where: { current_owner_id: currentOwnerId },
    });
  }

  // Helper method to get by status
  async findByStatus(status: OwnershipTransferStatus): Promise<OwnershipTransfer[]> {
    return this.ownershipTransferRepository.find({
      where: { status },
    });
  }
}