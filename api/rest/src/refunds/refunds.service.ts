// refunds/refunds.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/pagination/paginate';
import { Refund, RefundStatus } from './entities/refund.entity';
import { CreateRefundDto } from './dto/create-refund.dto';
import { GetRefundDto, RefundPaginator } from './dto/get-refunds.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class RefundsService {
  private refunds: Refund[] = [];

  async create(createRefundDto: CreateRefundDto): Promise<Refund> {
    const newRefund: Refund = {
      id: this.refunds.length + 1,
      amount: createRefundDto.amount,
      status: createRefundDto.status || RefundStatus.PENDING,
      order_id: createRefundDto.order_id,
      customer_id: createRefundDto.customer_id,
      reason: createRefundDto.reason,
      created_at: new Date(),
      updated_at: new Date(),
    } as Refund;

    this.refunds.push(newRefund);
    return newRefund;
  }

  async findAll({
    limit = 10,
    page = 1,
    status,
    customer_id,
    order_id,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetRefundDto): Promise<RefundPaginator> {
    let data: Refund[] = [...this.refunds];

    // Apply filters
    if (status) {
      data = data.filter(refund => refund.status === status);
    }

    if (customer_id) {
      data = data.filter(refund => refund.customer_id === customer_id);
    }

    if (order_id) {
      data = data.filter(refund => refund.order_id === order_id);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortedBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (orderBy === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = data.slice(startIndex, endIndex);

    const url = `/refunds?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(id: number): Promise<Refund> {
    const refund = this.refunds.find(r => r.id === id);
    
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }
    
    return refund;
  }

  async update(id: number, updateRefundDto: UpdateRefundDto): Promise<Refund> {
    const refundIndex = this.refunds.findIndex(r => r.id === id);
    
    if (refundIndex === -1) {
      throw new NotFoundException('Refund not found');
    }

    const updatedRefund = {
      ...this.refunds[refundIndex],
      ...updateRefundDto,
      updated_at: new Date()
    };

    this.refunds[refundIndex] = updatedRefund as Refund;
    return updatedRefund as Refund;
  }

  async approve(id: number): Promise<Refund> {
    const refundIndex = this.refunds.findIndex(r => r.id === id);
    
    if (refundIndex === -1) {
      throw new NotFoundException('Refund not found');
    }

    this.refunds[refundIndex].status = RefundStatus.APPROVED;
    this.refunds[refundIndex].updated_at = new Date();
    
    return this.refunds[refundIndex];
  }

  async reject(id: number): Promise<Refund> {
    const refundIndex = this.refunds.findIndex(r => r.id === id);
    
    if (refundIndex === -1) {
      throw new NotFoundException('Refund not found');
    }

    this.refunds[refundIndex].status = RefundStatus.REJECTED;
    this.refunds[refundIndex].updated_at = new Date();
    
    return this.refunds[refundIndex];
  }

  async process(id: number): Promise<Refund> {
    const refundIndex = this.refunds.findIndex(r => r.id === id);
    
    if (refundIndex === -1) {
      throw new NotFoundException('Refund not found');
    }

    this.refunds[refundIndex].status = RefundStatus.PROCESSING;
    this.refunds[refundIndex].updated_at = new Date();
    
    return this.refunds[refundIndex];
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const refundIndex = this.refunds.findIndex(r => r.id === id);
    
    if (refundIndex === -1) {
      throw new NotFoundException('Refund not found');
    }

    this.refunds.splice(refundIndex, 1);
    
    return {
      success: true,
      message: 'Refund deleted successfully'
    };
  }
}