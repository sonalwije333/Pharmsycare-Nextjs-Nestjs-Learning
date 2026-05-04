import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFaqsDto, FaqPaginator } from './dto/get-faqs.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { paginate } from 'src/common/pagination/paginate';
import { SortOrder } from 'src/common/enums/enums';
import { FaqOrderByColumn, FaqType } from 'src/common/enums/faq-type.enum';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    const slug = this.generateSlug(createFaqDto.faq_title);

    const existing = await this.faqRepository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('FAQ with this title already exists');
    }

    const faqData: Partial<Faq> = {
      faq_title: createFaqDto.faq_title,
      faq_description: createFaqDto.faq_description,
      slug,
      faq_type: createFaqDto.faq_type || FaqType.GLOBAL,
      issued_by: createFaqDto.issued_by,
      shop_id: createFaqDto.shop_id,
      user_id: createFaqDto.user_id,
      language: createFaqDto.language || 'en',
      translated_languages: [createFaqDto.language || 'en'],
    };

    const faq = this.faqRepository.create(faqData);
    return this.faqRepository.save(faq);
  }

  async findAll({
    page = 1,
    limit = 10,
    search,
    faq_type,
    shop_id,
    issued_by,
    language,
    orderBy = FaqOrderByColumn.CREATED_AT,
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
      queryBuilder.andWhere(
        'faq.faq_title LIKE :search OR faq.faq_description LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (language) {
      queryBuilder.andWhere(
        '(faq.language = :language OR faq.translated_languages LIKE :languageLike)',
        { language, languageLike: `%${language}%` },
      );
    }

    let orderColumn: string;
    switch (orderBy) {
      case FaqOrderByColumn.FAQ_TITLE:
        orderColumn = 'faq.faq_title';
        break;
      case FaqOrderByColumn.FAQ_DESCRIPTION:
        orderColumn = 'faq.faq_description';
        break;
      case FaqOrderByColumn.UPDATED_AT:
        orderColumn = 'faq.updated_at';
        break;
      default:
        orderColumn = 'faq.created_at';
    }

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

  async findOne(param: string, language?: string): Promise<Faq> {
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

    if (updateFaqDto.faq_title) {
      faq.faq_title = updateFaqDto.faq_title;
      faq.slug = this.generateSlug(updateFaqDto.faq_title);
    }

    if (updateFaqDto.faq_description !== undefined) {
      faq.faq_description = updateFaqDto.faq_description;
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
}