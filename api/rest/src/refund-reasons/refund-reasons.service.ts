// refund-reasons/refund-reasons.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { RefundReason } from './entities/refund-reasons.entity';
import { CreateRefundReasonDto } from './dto/create-refund-reasons.dto';
import { GetRefundReasonDto, RefundReasonPaginator } from './dto/get-refund-reasons.dto';
import { UpdateRefundReasonDto } from './dto/update-refund-reasons.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import refundReasonJSON from '@db/refund-reasons.json';

@Injectable()
export class RefundReasonsService {
  private refundReasons: RefundReason[] = plainToClass(RefundReason, refundReasonJSON);

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createRefundReasonDto: CreateRefundReasonDto): Promise<RefundReason> {
    // Check if reason with same name exists
    const existingReason = this.refundReasons.find(
      r => r.name === createRefundReasonDto.name && r.language === (createRefundReasonDto.language || 'en')
    );
    if (existingReason) {
      throw new ConflictException('Refund reason with this name already exists');
    }

    const newReason: RefundReason = {
      id: this.refundReasons.length + 1,
      slug: this.generateSlug(createRefundReasonDto.name),
      name: createRefundReasonDto.name,
      language: createRefundReasonDto.language || 'en',
      translated_languages: [createRefundReasonDto.language || 'en'],
      created_at: new Date(),
      updated_at: new Date()
    } as RefundReason;

    this.refundReasons.push(newReason);
    return newReason;
  }

  async findAllRefundReasons({
    search,
    limit = 10,
    page = 1,
    language,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetRefundReasonDto): Promise<RefundReasonPaginator> {
    let data: RefundReason[] = [...this.refundReasons];

    // Apply language filter
    if (language) {
      data = data.filter(reason => reason.language === language);
    }

    if (search) {
      const fuse = new Fuse(data, {
        keys: ['name'],
        threshold: 0.3,
      });
      data = fuse.search(search)?.map(({ item }) => item);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortedBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
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

    const url = `/refund-reasons?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getRefundReason(param: string, language?: string): Promise<RefundReason> {
    // Check if param is numeric (ID) or string (slug)
    const isNumeric = /^\d+$/.test(param);
    
    let reason: RefundReason | undefined;
    
    if (isNumeric) {
      reason = this.refundReasons.find(r => r.id === parseInt(param));
    } else {
      reason = this.refundReasons.find(r => r.slug === param);
    }

    if (!reason) {
      throw new NotFoundException('Refund reason not found');
    }

    // Handle language translation if needed
    if (language && language !== 'en') {
      // Here you would fetch translated version
      // For now, return the original
      return reason;
    }

    return reason;
  }

  async update(id: number, updateRefundReasonDto: UpdateRefundReasonDto): Promise<RefundReason> {
    const reasonIndex = this.refundReasons.findIndex(r => r.id === id);
    
    if (reasonIndex === -1) {
      throw new NotFoundException('Refund reason not found');
    }

    const updatedReason = {
      ...this.refundReasons[reasonIndex],
      ...updateRefundReasonDto,
      updated_at: new Date()
    };

    if (updateRefundReasonDto.name) {
      updatedReason.slug = this.generateSlug(updateRefundReasonDto.name);
    }

    this.refundReasons[reasonIndex] = updatedReason as RefundReason;
    return updatedReason as RefundReason;
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const reasonIndex = this.refundReasons.findIndex(r => r.id === id);
    
    if (reasonIndex === -1) {
      throw new NotFoundException('Refund reason not found');
    }

    this.refundReasons.splice(reasonIndex, 1);
    
    return {
      success: true,
      message: 'Refund reason deleted successfully'
    };
  }
}