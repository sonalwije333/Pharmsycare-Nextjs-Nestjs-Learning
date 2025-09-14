import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTermsAndConditionsDto } from './dto/create-terms-and-conditions.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TermsAndConditions } from './entities/terms-and-conditions.entity';
import { Like, Repository } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { UpdateTermsAndConditionsDto } from './dto/update-terms-and-conditions.dto';
import { generateSlug } from 'src/utils/generate-slug';
import {SortOrder} from "../common/dto/generic-conditions.dto";
import {GetTermsAndConditionsDto, TermsAndConditionsPaginator} from "./dto/get-terms-and-conditions.dto";
import {QueryTermsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class TermsAndConditionsService {
    constructor(
        @InjectRepository(TermsAndConditions)
        private readonly termsRepository: Repository<TermsAndConditions>,
    ) {}

    async getTermsPaginated({
                                limit = 30,
                                page = 1,
                                search,
                                orderBy,
                                sortOrder = SortOrder.DESC, // Changed from sortedBy to sortOrder
                                type,
                                issued_by,
                                user_id,
                                shop_id,
                                is_approved,
                                language,
                            }: GetTermsAndConditionsDto): Promise<TermsAndConditionsPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        // Build where conditions
        const where: any = {};

        if (search) {
            where.title = Like(`%${search}%`);
        }

        if (language) {
            where.language = language;
        }

        if (type) {
            where.type = type;
        }

        if (issued_by) {
            where.issued_by = issued_by;
        }

        if (user_id) {
            where.user_id = user_id;
        }

        if (shop_id) {
            where.shop_id = shop_id;
        }

        if (is_approved !== undefined) {
            where.is_approved = is_approved;
        }

        // Build order object
        let order = {};
        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            order[column] = sortOrder; // Changed from sortedBy to sortOrder
        } else {
            order = { created_at: sortOrder }; // Changed from createdAt to created_at
        }

        const [results, total] = await this.termsRepository.findAndCount({
            where,
            take,
            skip,
            order,
        });

        const url = `/terms-and-conditions?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryTermsOrderByColumn): string {
        switch (orderBy) {
            case QueryTermsOrderByColumn.TITLE:
                return 'title';
            case QueryTermsOrderByColumn.IS_APPROVED:
                return 'is_approved';
            case QueryTermsOrderByColumn.UPDATED_AT:
                return 'updated_at'; // Changed from updatedAt to updated_at
            case QueryTermsOrderByColumn.CREATED_AT:
            default:
                return 'created_at'; // Changed from createdAt to created_at
        }
    }

    async getAllTerms(language?: string): Promise<TermsAndConditions[]> {
        const where = language ? { language } : {};
        return this.termsRepository.find({
            where,
            order: { created_at: 'DESC' }, // Changed from createdAt to created_at
        });
    }

    async findOne(id: number): Promise<TermsAndConditions> { // Changed from string to number
        const terms = await this.termsRepository.findOne({
            where: { id },
        });

        if (!terms) {
            throw new NotFoundException(`Terms and Conditions with ID ${id} not found`);
        }

        return terms;
    }

    async findBySlug(slug: string): Promise<TermsAndConditions> {
        const terms = await this.termsRepository.findOne({
            where: { slug },
        });

        if (!terms) {
            throw new NotFoundException(`Terms and Conditions with slug ${slug} not found`);
        }

        return terms;
    }

    async create(createTermsAndConditionsDto: CreateTermsAndConditionsDto): Promise<TermsAndConditions> {
        const slug = createTermsAndConditionsDto.slug || generateSlug(createTermsAndConditionsDto.title);

        const terms = this.termsRepository.create({
            ...createTermsAndConditionsDto,
            slug,
            language: createTermsAndConditionsDto.language || 'en',
            is_approved: createTermsAndConditionsDto.is_approved || false,
            translated_languages: createTermsAndConditionsDto.translated_languages || [],
        });

        return await this.termsRepository.save(terms);
    }

    async update(id: number, updateTermsAndConditionsDto: UpdateTermsAndConditionsDto): Promise<TermsAndConditions> { // Changed from string to number
        const terms = await this.termsRepository.findOneBy({ id });

        if (!terms) {
            throw new NotFoundException(`Terms and Conditions with ID ${id} not found`);
        }

        // If title is being updated and no slug is provided, generate a new slug
        if (updateTermsAndConditionsDto.title && !updateTermsAndConditionsDto.slug) {
            updateTermsAndConditionsDto.slug = generateSlug(updateTermsAndConditionsDto.title);
        }

        // Merge the update data into the existing entity
        const updated = this.termsRepository.merge(terms, updateTermsAndConditionsDto);

        // Save and return the updated entity
        return this.termsRepository.save(updated);
    }

    async remove(id: number): Promise<void> { // Changed from string to number
        const terms = await this.termsRepository.findOneBy({ id });

        if (!terms) {
            throw new NotFoundException(`Terms and Conditions with ID ${id} not found`);
        }

        await this.termsRepository.remove(terms);
    }

    async approve(id: number): Promise<TermsAndConditions> { // Changed from string to number
        const terms = await this.termsRepository.findOneBy({ id });

        if (!terms) {
            throw new NotFoundException(`Terms and Conditions with ID ${id} not found`);
        }

        terms.is_approved = true;
        return this.termsRepository.save(terms);
    }

    async disapprove(id: number): Promise<TermsAndConditions> { // Changed from string to number
        const terms = await this.termsRepository.findOneBy({ id });

        if (!terms) {
            throw new NotFoundException(`Terms and Conditions with ID ${id} not found`);
        }

        terms.is_approved = false;
        return this.termsRepository.save(terms);
    }
}