import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetFaqsDto, FaqPaginator } from './dto/get-faqs.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './entities/faq.entity';
import { paginate } from '../common/pagination/paginate';
import { QueryFaqsOrderByColumn } from "../../common/enums/enums";
import { SortOrder } from "../common/dto/generic-conditions.dto";
import { generateSlug } from "../../utils/generate-slug";

@Injectable()
export class FaqsService {
    constructor(
        @InjectRepository(Faq)
        private readonly faqRepository: Repository<Faq>,
    ) {}

    async create(createFaqDto: CreateFaqDto): Promise<Faq> {
        // Use optional chaining and provide a default empty string if slug is undefined
        const slug = createFaqDto.slug || generateSlug(createFaqDto.faq_title);

        const faq = this.faqRepository.create({
            ...createFaqDto,
            slug,
            language: createFaqDto.language || 'en',
            translated_languages: createFaqDto.translated_languages || [],
        });

        return await this.faqRepository.save(faq);
    }

    async findAllFaqs({
                          page = 1,
                          limit = 30,
                          search,
                          language,
                          faq_type,
                          shop_id,
                          issued_by,
                          orderBy,
                          sortOrder = SortOrder.DESC
                      }: GetFaqsDto): Promise<FaqPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.faqRepository.createQueryBuilder('faq');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('(faq.faq_title ILIKE :search OR faq.faq_description ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (language) {
            queryBuilder.andWhere('faq.language = :language', { language });
        }

        if (faq_type) {
            queryBuilder.andWhere('faq.faq_type = :faq_type', { faq_type });
        }

        if (shop_id) {
            queryBuilder.andWhere('faq.shop_id = :shop_id', { shop_id });
        }

        if (issued_by) {
            queryBuilder.andWhere('faq.issued_by = :issued_by', { issued_by });
        }

        // Apply ordering - convert SortOrder enum to string
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`faq.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('faq.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/faqs?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryFaqsOrderByColumn): string {
        switch (orderBy) {
            case QueryFaqsOrderByColumn.FAQ_TITLE:
                return 'faq_title';
            case QueryFaqsOrderByColumn.FAQ_DESCRIPTION:
                return 'faq_description';
            case QueryFaqsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryFaqsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async getFaq(param: string, language?: string): Promise<Faq> {
        const queryBuilder = this.faqRepository.createQueryBuilder('faq');

        if (!isNaN(Number(param))) {
            queryBuilder.where('faq.id = :id', { id: Number(param) });
        } else {
            queryBuilder.where('faq.slug = :slug', { slug: param });
        }

        if (language) {
            queryBuilder.andWhere('faq.language = :language', { language });
        }

        const faq = await queryBuilder.getOne();

        if (!faq) {
            throw new NotFoundException(`FAQ with identifier ${param} not found`);
        }

        return faq;
    }

    async update(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
        const faq = await this.faqRepository.findOneBy({ id });

        if (!faq) {
            throw new NotFoundException(`FAQ with ID ${id} not found`);
        }

        // If title is being updated and no slug is provided, generate a new slug
        if (updateFaqDto.faq_title && !updateFaqDto.slug) {
            updateFaqDto.slug = generateSlug(updateFaqDto.faq_title);
        }

        const updated = this.faqRepository.merge(faq, updateFaqDto);
        return this.faqRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const faq = await this.faqRepository.findOneBy({ id });

        if (!faq) {
            throw new NotFoundException(`FAQ with ID ${id} not found`);
        }

        // Soft delete implementation
        faq.deleted_at = new Date();
        await this.faqRepository.save(faq);
    }
}