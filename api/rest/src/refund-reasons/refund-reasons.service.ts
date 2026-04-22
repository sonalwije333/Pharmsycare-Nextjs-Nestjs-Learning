// refund-reasons/refund-reasons.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from 'src/common/pagination/paginate';
import { RefundReason } from './entities/refund-reasons.entity';
import { CreateRefundReasonDto } from './dto/create-refund-reasons.dto';
import { GetRefundReasonDto, RefundReasonPaginator } from './dto/get-refund-reasons.dto';
import { UpdateRefundReasonDto } from './dto/update-refund-reasons.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class RefundReasonsService {
  constructor(
    @InjectRepository(RefundReason)
    private readonly refundReasonsRepository: Repository<RefundReason>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
    let candidate = baseSlug;
    let suffix = 1;

    while (true) {
      const query = this.refundReasonsRepository
        .createQueryBuilder('refund_reason')
        .where('refund_reason.slug = :slug', { slug: candidate });

      if (excludeId) {
        query.andWhere('refund_reason.id != :excludeId', { excludeId });
      }

      const existing = await query.getOne();
      if (!existing) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  async create(createRefundReasonDto: CreateRefundReasonDto): Promise<RefundReason> {
    const language = createRefundReasonDto.language || createRefundReasonDto.languages || 'en';

    const existingReason = await this.refundReasonsRepository.findOne({
      where: {
        name: createRefundReasonDto.name,
        language,
      },
    });

    if (existingReason) {
      throw new ConflictException('Refund reason with this name already exists');
    }

    const baseSlug = this.generateSlug(
      createRefundReasonDto.slug || createRefundReasonDto.name,
    );
    const slug = await this.generateUniqueSlug(baseSlug);

    const newReason = this.refundReasonsRepository.create({
      slug,
      name: createRefundReasonDto.name,
      language,
      translated_languages: [language],
    } as Partial<RefundReason>);

    return this.refundReasonsRepository.save(newReason);
  }

  async findAllRefundReasons({
    search,
    limit = 10,
    page = 1,
    language,
    orderBy = 'created_at',
    sortedBy = 'desc',
  }: GetRefundReasonDto): Promise<RefundReasonPaginator> {
    const queryBuilder = this.refundReasonsRepository.createQueryBuilder('refund_reason');

    if (language) {
      queryBuilder.andWhere('refund_reason.language = :language', { language });
    }

    if (search) {
      queryBuilder.andWhere('refund_reason.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    const allowedOrderFields = ['created_at', 'updated_at', 'name'];
    const sortField = allowedOrderFields.includes((orderBy || '').toLowerCase())
      ? (orderBy || 'created_at').toLowerCase()
      : 'created_at';
    const sortDirection = (sortedBy || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`refund_reason.${sortField}`, sortDirection);

    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/refund-reasons?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async getRefundReason(param: string, language?: string): Promise<RefundReason> {
    const isNumeric = /^\d+$/.test(param);

    let reason: RefundReason | null = null;

    if (isNumeric) {
      reason = await this.refundReasonsRepository.findOne({
        where: { id: parseInt(param, 10) },
      });
    } else {
      reason = await this.refundReasonsRepository.findOne({
        where: { slug: param },
      });
    }

    if (!reason) {
      throw new NotFoundException('Refund reason not found');
    }

    if (language && reason.language !== language) {
      const translated = await this.refundReasonsRepository.findOne({
        where: { slug: reason.slug, language },
      });
      if (translated) {
        return translated;
      }
    }

    return reason;
  }

  async update(id: number, updateRefundReasonDto: UpdateRefundReasonDto): Promise<RefundReason> {
    const reason = await this.refundReasonsRepository.findOne({ where: { id } });

    if (!reason) {
      throw new NotFoundException('Refund reason not found');
    }

    if (updateRefundReasonDto.name && updateRefundReasonDto.name !== reason.name) {
      const existing = await this.refundReasonsRepository.findOne({
        where: {
          name: updateRefundReasonDto.name,
          language: updateRefundReasonDto.language || reason.language,
        },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Refund reason with this name already exists');
      }
    }

    let slug: string | undefined;
    if (updateRefundReasonDto.name) {
      slug = await this.generateUniqueSlug(this.generateSlug(updateRefundReasonDto.name), id);
    }
    if (updateRefundReasonDto.slug) {
      slug = await this.generateUniqueSlug(this.generateSlug(updateRefundReasonDto.slug), id);
    }

    const translatedLanguages = [...(reason.translated_languages || [])];
    const effectiveLanguage = updateRefundReasonDto.language || reason.language;
    if (effectiveLanguage && !translatedLanguages.includes(effectiveLanguage)) {
      translatedLanguages.push(effectiveLanguage);
    }

    Object.assign(reason, {
      ...updateRefundReasonDto,
      ...(slug ? { slug } : {}),
      translated_languages: translatedLanguages,
    });

    return this.refundReasonsRepository.save(reason);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const reason = await this.refundReasonsRepository.findOne({ where: { id } });

    if (!reason) {
      throw new NotFoundException('Refund reason not found');
    }

    await this.refundReasonsRepository.remove(reason);
    
    return {
      success: true,
      message: 'Refund reason deleted successfully'
    };
  }
}