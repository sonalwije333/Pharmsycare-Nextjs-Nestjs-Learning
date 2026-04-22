// refund-policies/refund-policies.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from 'src/common/pagination/paginate';
import { RefundPolicy } from './entities/refund-policies.entity';
import { CreateRefundPolicyDto } from './dto/create-refund-policy.dto';
import { GetRefundPolicyDto, RefundPolicyPaginator } from './dto/get-refund-policies.dto';
import { UpdateRefundPolicyDto } from './dto/update-refund-policy.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class RefundPoliciesService {
  constructor(
    @InjectRepository(RefundPolicy)
    private readonly refundPoliciesRepository: Repository<RefundPolicy>,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
    let candidate = baseSlug;
    let suffix = 1;

    while (true) {
      const existing = await this.refundPoliciesRepository
        .createQueryBuilder('refund_policy')
        .where('refund_policy.slug = :slug', { slug: candidate })
        .andWhere(excludeId ? 'refund_policy.id != :excludeId' : '1=1', { excludeId })
        .getOne();

      if (!existing) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  async create(createRefundPolicyDto: CreateRefundPolicyDto): Promise<RefundPolicy> {
    const language = createRefundPolicyDto.language || 'en';
    const existingPolicy = await this.refundPoliciesRepository.findOne({
      where: {
        title: createRefundPolicyDto.title,
        language,
      },
    });

    if (existingPolicy) {
      throw new ConflictException('Refund policy with this title already exists');
    }

    const baseSlug = this.generateSlug(
      createRefundPolicyDto.slug || createRefundPolicyDto.title,
    );
    const uniqueSlug = await this.generateUniqueSlug(baseSlug);

    const newPolicy = this.refundPoliciesRepository.create({
      slug: uniqueSlug,
      title: createRefundPolicyDto.title,
      target: createRefundPolicyDto.target,
      status: createRefundPolicyDto.status,
      description: createRefundPolicyDto.description || '',
      language,
      translated_languages: [language],
    } as Partial<RefundPolicy>);

    return this.refundPoliciesRepository.save(newPolicy);
  }

  async findAllRefundPolicies({
    search,
    limit = 10,
    page = 1,
    target,
    status,
    language,
    orderBy = 'created_at',
    sortedBy = 'desc'
  }: GetRefundPolicyDto): Promise<RefundPolicyPaginator> {
    const queryBuilder = this.refundPoliciesRepository.createQueryBuilder('refund_policy');

    const rawSearchParams = search?.split(';').filter(Boolean) ?? [];
    let titleSearch: string | undefined;
    let targetSearch: string | undefined;
    let statusSearch: string | undefined;
    let plainSearch: string | undefined;

    for (const rawParam of rawSearchParams) {
      const separatorIndex = rawParam.indexOf(':');
      if (separatorIndex === -1) {
        plainSearch = rawParam.trim();
        continue;
      }

      const key = rawParam.slice(0, separatorIndex).trim();
      const value = rawParam.slice(separatorIndex + 1).trim();
      if (!value) continue;

      if (key === 'title') {
        titleSearch = value;
        continue;
      }

      if (key === 'target') {
        targetSearch = value;
        continue;
      }

      if (key === 'status') {
        statusSearch = value;
      }
    }

    const effectiveTarget = target ?? targetSearch;
    const effectiveStatus = status ?? statusSearch;

    if (effectiveTarget) {
      queryBuilder.andWhere('refund_policy.target = :target', { target: effectiveTarget });
    }

    if (effectiveStatus) {
      queryBuilder.andWhere('refund_policy.status = :status', { status: effectiveStatus });
    }

    if (language) {
      queryBuilder.andWhere('refund_policy.language = :language', { language });
    }

    if (titleSearch) {
      queryBuilder.andWhere(
        '(refund_policy.title LIKE :titleSearch OR refund_policy.description LIKE :titleSearch)',
        { titleSearch: `%${titleSearch}%` },
      );
    } else if (plainSearch) {
      queryBuilder.andWhere(
        '(refund_policy.title LIKE :plainSearch OR refund_policy.description LIKE :plainSearch)',
        { plainSearch: `%${plainSearch}%` },
      );
    }

    const allowedOrderFields = ['created_at', 'updated_at', 'title', 'description'];
    const sortField = allowedOrderFields.includes((orderBy || '').toLowerCase())
      ? (orderBy || 'created_at').toLowerCase()
      : 'created_at';
    const sortDirection = (sortedBy || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    queryBuilder.orderBy(
      `refund_policy.${sortField}`,
      (sortDirection.toUpperCase() as 'ASC' | 'DESC'),
    );

    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/refund-policies?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getRefundPolicy(param: string, language?: string): Promise<RefundPolicy> {
    const isNumeric = /^\d+$/.test(param);

    let policy: RefundPolicy | null = null;

    if (isNumeric) {
      policy = await this.refundPoliciesRepository.findOne({
        where: { id: parseInt(param, 10) },
      });
    } else {
      policy = await this.refundPoliciesRepository.findOne({
        where: { slug: param },
      });
    }

    if (!policy) {
      throw new NotFoundException('Refund policy not found');
    }

    if (language && policy.language !== language) {
      const translated = await this.refundPoliciesRepository.findOne({
        where: { slug: policy.slug, language },
      });
      if (translated) {
        return translated;
      }
    }

    return policy;
  }

  async update(id: number, updateRefundPolicyDto: UpdateRefundPolicyDto): Promise<RefundPolicy> {
    const policy = await this.refundPoliciesRepository.findOne({ where: { id } });

    if (!policy) {
      throw new NotFoundException('Refund policy not found');
    }

    if (updateRefundPolicyDto.title && updateRefundPolicyDto.title !== policy.title) {
      const existingTitle = await this.refundPoliciesRepository.findOne({
        where: {
          title: updateRefundPolicyDto.title,
          language: updateRefundPolicyDto.language || policy.language,
        },
      });
      if (existingTitle && existingTitle.id !== id) {
        throw new ConflictException('Refund policy with this title already exists');
      }
    }

    let slug: string | undefined;
    if (updateRefundPolicyDto.slug) {
      slug = await this.generateUniqueSlug(this.generateSlug(updateRefundPolicyDto.slug), id);
    } else if (updateRefundPolicyDto.title) {
      slug = await this.generateUniqueSlug(this.generateSlug(updateRefundPolicyDto.title), id);
    }

    const translatedLanguages = [...(policy.translated_languages || [])];
    if (updateRefundPolicyDto.language && !translatedLanguages.includes(updateRefundPolicyDto.language)) {
      translatedLanguages.push(updateRefundPolicyDto.language);
    }

    Object.assign(policy, {
      ...updateRefundPolicyDto,
      ...(slug ? { slug } : {}),
      translated_languages: translatedLanguages,
    });

    return this.refundPoliciesRepository.save(policy);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const policy = await this.refundPoliciesRepository.findOne({ where: { id } });

    if (!policy) {
      throw new NotFoundException('Refund policy not found');
    }

    await this.refundPoliciesRepository.remove(policy);
    
    return {
      success: true,
      message: 'Refund policy deleted successfully'
    };
  }
}