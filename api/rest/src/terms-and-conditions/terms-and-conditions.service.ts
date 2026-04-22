// terms-and-conditions/terms-and-conditions.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'src/common/pagination/paginate';
import { Repository } from 'typeorm';
import { TermsAndConditions } from './entities/terms-and-conditions.entity';
import { CreateTermsAndConditionsDto } from './dto/create-terms-and-conditions.dto';
import { GetTermsAndConditionsDto, TermsAndConditionsPaginator } from './dto/get-terms-and-conditions.dto';
import { UpdateTermsAndConditionsDto } from './dto/update-terms-and-conditions.dto';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class TermsAndConditionsService {
  constructor(
    @InjectRepository(TermsAndConditions)
    private readonly termsAndConditionsRepository: Repository<TermsAndConditions>,
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
      const existing = await this.termsAndConditionsRepository
        .createQueryBuilder('terms_and_conditions')
        .where('terms_and_conditions.slug = :slug', { slug: candidate })
        .andWhere(excludeId ? 'terms_and_conditions.id != :excludeId' : '1=1', { excludeId })
        .getOne();

      if (!existing) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  async create(createTermsAndConditionsDto: CreateTermsAndConditionsDto): Promise<TermsAndConditions> {
    const language = createTermsAndConditionsDto.language || 'en';
    const existingTerms = await this.termsAndConditionsRepository.findOne({
      where: {
        title: createTermsAndConditionsDto.title,
        language,
      },
    });

    if (existingTerms) {
      throw new ConflictException('Terms with this title already exists');
    }

    const uniqueSlug = await this.generateUniqueSlug(this.generateSlug(createTermsAndConditionsDto.title));

    const newTerms = this.termsAndConditionsRepository.create({
      slug: uniqueSlug,
      title: createTermsAndConditionsDto.title,
      description: createTermsAndConditionsDto.description,
      type: createTermsAndConditionsDto.type || 'global',
      issued_by: createTermsAndConditionsDto.issued_by || 'Super Admin',
      language,
      shop_id: createTermsAndConditionsDto.shop_id?.toString(),
      translated_languages: [language],
      is_approved: false,
      created_at: new Date(),
      updated_at: new Date(),
    } as Partial<TermsAndConditions>);

    return this.termsAndConditionsRepository.save(newTerms);
  }

  async findAllTermsAndConditions({
    search,
    limit = 10,
    page = 1,
    type,
    issued_by,
    is_approved,
    language,
    sortedBy = 'created_at',
    orderBy = 'DESC'
  }: GetTermsAndConditionsDto): Promise<TermsAndConditionsPaginator> {
    const queryBuilder = this.termsAndConditionsRepository.createQueryBuilder('terms_and_conditions');

    if (type) {
      queryBuilder.andWhere('terms_and_conditions.type = :type', { type });
    }

    if (issued_by) {
      queryBuilder.andWhere('terms_and_conditions.issued_by = :issued_by', { issued_by });
    }

    if (is_approved !== undefined) {
      queryBuilder.andWhere('terms_and_conditions.is_approved = :is_approved', { is_approved });
    }

    if (language) {
      queryBuilder.andWhere('terms_and_conditions.language = :language', { language });
    }

    if (search) {
      queryBuilder.andWhere(
        '(terms_and_conditions.title LIKE :search OR terms_and_conditions.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedOrderFields = ['created_at', 'updated_at', 'title', 'description'];
    const sortField = allowedOrderFields.includes((orderBy || '').toLowerCase())
      ? (orderBy || 'created_at').toLowerCase()
      : 'created_at';
    const sortDirection = (sortedBy || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    queryBuilder.orderBy(
      `terms_and_conditions.${sortField}`,
      (sortDirection.toUpperCase() as 'ASC' | 'DESC'),
    );

    const [results, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const url = `/terms-and-conditions?limit=${limit}`;
    const paginationInfo = paginate(total, page, limit, results.length, url);

    return {
      data: results,
      ...paginationInfo,
    };
  }

  async findOne(param: string, language?: string): Promise<TermsAndConditions> {
    const isNumeric = /^\d+$/.test(param);
    
    let terms: TermsAndConditions | null | undefined;
    
    if (isNumeric) {
      terms = await this.termsAndConditionsRepository.findOne({
        where: { id: parseInt(param, 10) },
      });
    } else {
      terms = await this.termsAndConditionsRepository.findOne({
        where: { slug: param },
      });
    }

    if (!terms) {
      throw new NotFoundException('Terms and conditions not found');
    }

    // Handle language translation if needed
    if (language && language !== 'en') {

      return terms;
    }

    return terms;
  }

  async update(id: number, updateTermsAndConditionsDto: UpdateTermsAndConditionsDto): Promise<TermsAndConditions> {
    const terms = await this.termsAndConditionsRepository.findOne({ where: { id } });

    if (!terms) {
      throw new NotFoundException('Terms and conditions not found');
    }

    if (updateTermsAndConditionsDto.title && updateTermsAndConditionsDto.title !== terms.title) {
      const existingTitle = await this.termsAndConditionsRepository.findOne({
        where: {
          title: updateTermsAndConditionsDto.title,
          language: updateTermsAndConditionsDto.language || terms.language,
        },
      });

      if (existingTitle && existingTitle.id !== id) {
        throw new ConflictException('Terms with this title already exists');
      }
    }

    const slug = updateTermsAndConditionsDto.title
      ? await this.generateUniqueSlug(this.generateSlug(updateTermsAndConditionsDto.title), id)
      : undefined;

    const translatedLanguages = [...(terms.translated_languages || [])];
    if (updateTermsAndConditionsDto.language && !translatedLanguages.includes(updateTermsAndConditionsDto.language)) {
      translatedLanguages.push(updateTermsAndConditionsDto.language);
    }

    Object.assign(terms, {
      ...updateTermsAndConditionsDto,
      ...(updateTermsAndConditionsDto.shop_id !== undefined
        ? {
            shop_id:
              updateTermsAndConditionsDto.shop_id === null
                ? null
                : updateTermsAndConditionsDto.shop_id.toString(),
          }
        : {}),
      ...(slug ? { slug } : {}),
      translated_languages: translatedLanguages,
    });

    return this.termsAndConditionsRepository.save(terms);
  }

  async approveTermsAndCondition(id: number): Promise<TermsAndConditions> {
    const terms = await this.termsAndConditionsRepository.findOne({ where: { id } });

    if (!terms) {
      throw new NotFoundException('Terms and conditions not found');
    }

    terms.is_approved = true;
    return this.termsAndConditionsRepository.save(terms);
  }

  async disapproveTermsAndCondition(id: number): Promise<TermsAndConditions> {
    const terms = await this.termsAndConditionsRepository.findOne({ where: { id } });

    if (!terms) {
      throw new NotFoundException('Terms and conditions not found');
    }

    terms.is_approved = false;
    return this.termsAndConditionsRepository.save(terms);
  }

  async remove(id: number): Promise<CoreMutationOutput> {
    const terms = await this.termsAndConditionsRepository.findOne({ where: { id } });

    if (!terms) {
      throw new NotFoundException('Terms and conditions not found');
    }

    await this.termsAndConditionsRepository.remove(terms);
    
    return {
      success: true,
      message: 'Terms and conditions deleted successfully'
    };
  }
}