// refund-policies/refund-policies.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { RefundPolicy } from './entities/refund-policies.entity';
import { CreateRefundPolicyDto } from './dto/create-refund-policy.dto';
import { GetRefundPolicyDto, RefundPolicyPaginator } from './dto/get-refund-policies.dto';
import { UpdateRefundPolicyDto } from './dto/update-refund-policy.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import refundPolicyJSON from '@db/refund-policies.json';

@Injectable()
export class RefundPoliciesService {
  private refundPolicy: RefundPolicy[] = plainToClass(RefundPolicy, refundPolicyJSON);

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createRefundPolicyDto: CreateRefundPolicyDto): Promise<RefundPolicy> {
    // Check if policy with same title exists
    const existingPolicy = this.refundPolicy.find(p => p.title === createRefundPolicyDto.title);
    if (existingPolicy) {
      throw new ConflictException('Refund policy with this title already exists');
    }

    const newPolicy: RefundPolicy = {
      id: this.refundPolicy.length + 1,
      slug: this.generateSlug(createRefundPolicyDto.title),
      title: createRefundPolicyDto.title,
      target: createRefundPolicyDto.target,
      status: createRefundPolicyDto.status,
      description: createRefundPolicyDto.description || '',
      language: createRefundPolicyDto.language || 'en',
      translated_languages: [createRefundPolicyDto.language || 'en'],
      created_at: new Date(),
      updated_at: new Date()
    } as RefundPolicy;

    this.refundPolicy.push(newPolicy);
    return newPolicy;
  }

  async findAllRefundPolicies({
    search,
    limit = 10,
    page = 1,
    target,
    status,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetRefundPolicyDto): Promise<RefundPolicyPaginator> {
    let data: RefundPolicy[] = [...this.refundPolicy];

    // Apply filters
    if (target) {
      data = data.filter(policy => policy.target === target);
    }

    if (status) {
      data = data.filter(policy => policy.status === status);
    }

    if (search) {
      const fuse = new Fuse(data, {
        keys: ['title', 'description'],
        threshold: 0.3,
      });
      data = fuse.search(search)?.map(({ item }) => item);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortedBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
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

    const url = `/refund-policies?limit=${limit}`;
    const paginationInfo = paginate(data.length, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getRefundPolicy(param: string, language?: string): Promise<RefundPolicy> {
    // Check if param is numeric (ID) or string (slug)
    const isNumeric = /^\d+$/.test(param);
    
    let policy: RefundPolicy | undefined;
    
    if (isNumeric) {
      policy = this.refundPolicy.find(p => p.id === parseInt(param));
    } else {
      policy = this.refundPolicy.find(p => p.slug === param);
    }

    if (!policy) {
      throw new NotFoundException('Refund policy not found');
    }

    // Handle language translation if needed
    if (language && language !== 'en') {
      // Here you would fetch translated version
      // For now, return the original
      return policy;
    }

    return policy;
  }

  async update(id: number, updateRefundPolicyDto: UpdateRefundPolicyDto): Promise<RefundPolicy> {
    const policyIndex = this.refundPolicy.findIndex(p => p.id === id);
    
    if (policyIndex === -1) {
      throw new NotFoundException('Refund policy not found');
    }

    const updatedPolicy = {
      ...this.refundPolicy[policyIndex],
      ...updateRefundPolicyDto,
      updated_at: new Date()
    };

    if (updateRefundPolicyDto.title) {
      updatedPolicy.slug = this.generateSlug(updateRefundPolicyDto.title);
    }

    this.refundPolicy[policyIndex] = updatedPolicy as RefundPolicy;
    return updatedPolicy as RefundPolicy;
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const policyIndex = this.refundPolicy.findIndex(p => p.id === id);
    
    if (policyIndex === -1) {
      throw new NotFoundException('Refund policy not found');
    }

    this.refundPolicy.splice(policyIndex, 1);
    
    return {
      success: true,
      message: 'Refund policy deleted successfully'
    };
  }
}