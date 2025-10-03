import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, In } from 'typeorm';
import {Refund} from "./entities/refund.entity";
import { CreateRefundDto } from "./dto/create-refund.dto";
import {RefundStatus} from "../../common/enums/enums";
import {GetRefundsDto, RefundPaginator} from "./dto/get-refunds.dto";

import {UpdateRefundDto} from "./dto/update-refund.dto";
import {UpdateRefundStatusDto} from "./dto/update-refund-status.dto";
import { paginate } from '../common/pagination/paginate';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
  ) {}

  async create(createRefundDto: CreateRefundDto, customerId: number): Promise<Refund> {
    // Verify that the customer owns the order
    // This would typically involve checking the order service
    // For now, we'll assume the customer has permission

    const refund = this.refundRepository.create({
      ...createRefundDto,
      customer_id: customerId,
      status: RefundStatus.PENDING,
    });

    return await this.refundRepository.save(refund);
  }

  async findAll({
                  page = 1,
                  limit = 10,
                  search,
                  status,
                  shop_id,
                  customer_id,
                  order_id,
                  orderBy,
                   sortedBy = 'DESC',
                }: GetRefundsDto): Promise<RefundPaginator> {
    const take = limit;
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<Refund> = {};

    if (search) {
      where.description = Like(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    if (shop_id) {
      where.shop_id = shop_id;
    }

    if (customer_id) {
      where.customer_id = customer_id;
    }

    if (order_id) {
      where.order_id = order_id;
    }

    let order = {};
    // if (orderBy) {
    //   const column = this.getOrderByColumn(orderBy);
    //   order[column] = sortedBy;
    // } else {
    //   order = { created_at: sortedBy };
    // }

    const [results, total] = await this.refundRepository.findAndCount({
      where,
      take,
      skip,
      order,
      relations: ['shop', 'order', 'customer'],
    });

    const url = `/refunds?search=${search ?? ''}&status=${status ?? ''}&limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(id: number): Promise<Refund> {
    const refund = await this.refundRepository.findOne({
      where: { id },
      relations: ['shop', 'order', 'customer'],
    });

    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found`);
    }

    return refund;
  }

  async findMyRefunds(customerId: number, query: GetRefundsDto): Promise<RefundPaginator> {
    return this.findAll({
      ...query,
      customer_id: customerId,
    });
  }

  async update(id: number, updateRefundDto: UpdateRefundDto, customerId?: number): Promise<Refund> {
    const refund = await this.findOne(id);

    // If customerId is provided, verify ownership
    if (customerId && refund.customer_id !== customerId) {
      throw new ForbiddenException('You can only update your own refunds');
    }

    // Only allow updates to certain fields if it's a customer
    if (customerId) {
      // Customers can only update description and images
      const { description, images, ...rest } = updateRefundDto;
      if (Object.keys(rest).length > 0) {
        throw new ForbiddenException('You can only update description and images');
      }
    }

    const updated = this.refundRepository.merge(refund, updateRefundDto);
    return await this.refundRepository.save(updated);
  }

  async updateStatus(id: number, updateRefundStatusDto: UpdateRefundStatusDto): Promise<Refund> {
    const refund = await this.findOne(id);

    const updated = this.refundRepository.merge(refund, {
      status: updateRefundStatusDto.status,
      note: updateRefundStatusDto.note,
      ...(updateRefundStatusDto.status === RefundStatus.APPROVED && { refunded_at: new Date() }),
    });

    return await this.refundRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const refund = await this.findOne(id);
    await this.refundRepository.remove(refund);
  }

  async getRefundStats(shopId?: number): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    processing: number;
  }> {
    const where: FindOptionsWhere<Refund> = {};
    if (shopId) {
      where.shop_id = shopId;
    }

    const refunds = await this.refundRepository.find({ where });

    return {
      total: refunds.length,
      pending: refunds.filter(r => r.status === RefundStatus.PENDING).length,
      approved: refunds.filter(r => r.status === RefundStatus.APPROVED).length,
      rejected: refunds.filter(r => r.status === RefundStatus.REJECTED).length,
      processing: refunds.filter(r => r.status === RefundStatus.PROCESSING).length,
    };
  }

  private getOrderByColumn(orderBy: string): string {
    switch (orderBy) {
      case 'AMOUNT':
        return 'amount';
      case 'STATUS':
        return 'status';
      case 'UPDATED_AT':
        return 'updated_at';
      case 'CREATED_AT':
      default:
        return 'created_at';
    }
  }
}