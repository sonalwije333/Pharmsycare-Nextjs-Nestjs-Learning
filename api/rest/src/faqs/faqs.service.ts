// faqs/faqs.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import {
  GetFaqsDto,
  FaqPaginator,
} from './dto/get-faqs.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { QueryFaqsOrderByColumn } from '../common/enums/enums';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    // Generate slug from title
    const slug = this.generateSlug(createFaqDto.faq_title);

    // Check if FAQ with same slug exists
    const existing = await this.faqRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('FAQ with this title already exists');
    }

    const faqData: Partial<Faq> = {
      faq_title: createFaqDto.faq_title,
      faq_description: this.normalizeFaqDescription(createFaqDto.faq_description),
      slug,
      faq_type: createFaqDto.faq_type || 'global',
      issued_by: createFaqDto.issued_by,
      shop_id: createFaqDto.shop_id,
      user_id: createFaqDto.user_id,
      language: createFaqDto.language || 'en',
      translated_languages: [createFaqDto.language || 'en'],
    };

    const faq = this.faqRepository.create(faqData);
    return this.faqRepository.save(faq);
  }

  async findAllFaqs({
    page = 1,
    limit = 10,
    search,
    searchJoin = 'and',
    faq_type,
    shop_id,
    issued_by,
    language,
    orderBy = QueryFaqsOrderByColumn.CREATED_AT,
    sortedBy = SortOrder.DESC,
  }: GetFaqsDto): Promise<FaqPaginator> {
    const queryBuilder = this.faqRepository.createQueryBuilder('faq');

    if (faq_type) {
      queryBuilder.andWhere('faq.faq_type = :faq_type', { faq_type });
    }

    if (shop_id) {
      queryBuilder.andWhere('faq.shop_id = :shop_id', { shop_id });
    }

    if (issued_by) {
      queryBuilder.andWhere('faq.issued_by = :issued_by', { issued_by });
    }

    if (search) {
      const rawSearchParams = search.split(';').filter(Boolean);
      let titleSearch: string | undefined;
      let descriptionSearch: string | undefined;
      let plainSearch: string | undefined;

      for (const rawParam of rawSearchParams) {
        const separatorIndex = rawParam.indexOf(':');
        if (separatorIndex === -1) {
          plainSearch = rawParam.trim();
          continue;
        }

        const key = rawParam.slice(0, separatorIndex).trim();
        const value = rawParam.slice(separatorIndex + 1).trim();
        if (!value) {
          continue;
        }

        if (key === 'faq_title') {
          titleSearch = value;
          continue;
        }

        if (key === 'faq_description') {
          descriptionSearch = value;
          continue;
        }

        plainSearch = value;
      }

      if (titleSearch || descriptionSearch) {
        const useOrJoin = String(searchJoin).toLowerCase() === 'or';

        queryBuilder.andWhere(
          new Brackets((qb) => {
            const joinMethod = useOrJoin ? 'orWhere' : 'andWhere';

            if (titleSearch) {
              qb[joinMethod]('faq.faq_title LIKE :titleSearch', {
                titleSearch: `%${titleSearch}%`,
              });
            }

            if (descriptionSearch) {
              qb[joinMethod]('faq.faq_description LIKE :descriptionSearch', {
                descriptionSearch: `%${descriptionSearch}%`,
              });
            }
          }),
        );
      } else {
        const fallbackSearch = plainSearch ?? search;
        queryBuilder.andWhere(
          '(faq.faq_title LIKE :fallbackSearch OR faq.faq_description LIKE :fallbackSearch)',
          { fallbackSearch: `%${fallbackSearch}%` },
        );
      }
    }

    if (language) {
      queryBuilder.andWhere(
        '(faq.language = :language OR faq.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    // Apply ordering
    const orderColumn =
      orderBy === QueryFaqsOrderByColumn.FAQ_TITLE
        ? 'faq.faq_title'
        : orderBy === QueryFaqsOrderByColumn.FAQ_DESCRIPTION
        ? 'faq.faq_description'
        : orderBy === QueryFaqsOrderByColumn.UPDATED_AT
        ? 'faq.updated_at'
        : 'faq.created_at';

    const orderDirection = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
    queryBuilder.orderBy(orderColumn, orderDirection);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const url = `/faqs?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, data.length, url);

    return {
      data,
      ...paginationInfo,
      current_page: page,
      per_page: limit,
      total,
      last_page: Math.ceil(total / limit),
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
    };
  }

  async getFaq(param: string, language?: string): Promise<Faq> {
    const isId = !isNaN(Number(param));

    const queryBuilder = this.faqRepository
      .createQueryBuilder('faq')
      .where(isId ? 'faq.id = :id' : 'faq.slug = :slug', {
        id: isId ? Number(param) : undefined,
        slug: isId ? undefined : param,
      });

    if (language) {
      queryBuilder.andWhere(
        '(faq.language = :language OR faq.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    const faq = await queryBuilder.getOne();

    if (!faq) {
      throw new NotFoundException(
        `FAQ with ${isId ? 'ID' : 'slug'} ${param} not found`,
      );
    }

    return faq;
  }

  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.faqRepository.findOne({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    // Update fields
    if (updateFaqDto.faq_title) {
      faq.faq_title = updateFaqDto.faq_title;
      faq.slug = this.generateSlug(updateFaqDto.faq_title);
    }

    if (updateFaqDto.faq_description !== undefined) {
      faq.faq_description = this.normalizeFaqDescription(
        updateFaqDto.faq_description,
      );
    }

    if (updateFaqDto.faq_type !== undefined) {
      faq.faq_type = updateFaqDto.faq_type;
    }

    if (updateFaqDto.issued_by !== undefined) {
      faq.issued_by = updateFaqDto.issued_by;
    }

    if (updateFaqDto.shop_id !== undefined) {
      faq.shop_id = updateFaqDto.shop_id;
    }

    if (updateFaqDto.user_id !== undefined) {
      faq.user_id = updateFaqDto.user_id;
    }

    if (updateFaqDto.language) {
      faq.language = updateFaqDto.language;
      if (!faq.translated_languages.includes(updateFaqDto.language)) {
        faq.translated_languages = [
          ...faq.translated_languages,
          updateFaqDto.language,
        ];
      }
    }

    return this.faqRepository.save(faq);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const faq = await this.faqRepository.findOne({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }

    // Soft delete
    await this.faqRepository.softDelete(id);

    return {
      success: true,
      message: `FAQ with ID ${id} deleted successfully`,
    };
  }

  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 5)
    );
  }

  private normalizeFaqDescription(value: string): string {
    return value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\u00a0/g, ' ')
      .trim();
  }
}
