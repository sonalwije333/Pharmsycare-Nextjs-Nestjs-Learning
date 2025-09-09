import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { RefundReason } from './entities/refund-reasons.entity';
import { CreateRefundReasonDto } from './dto/create-refund-reasons.dto';
import { GetRefundReasonDto } from './dto/get-refund-reasons.dto';
import { UpdateRefundReasonDto } from './dto/update-refund-reasons.dto';
import { paginate } from '../common/pagination/paginate';
import { generateSlug } from '../../utils/generate-slug';
import {QueryRefundReasonsOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class RefundReasonsService {
    constructor(
        @InjectRepository(RefundReason)
        private refundReasonRepository: Repository<RefundReason>,
    ) {}

    async create(createRefundReasonDto: CreateRefundReasonDto): Promise<RefundReason> {
        const slug = generateSlug(createRefundReasonDto.name);

        const refundReason = new RefundReason();
        Object.assign(refundReason, {
            ...createRefundReasonDto,
            slug,
            language: createRefundReasonDto.language || 'en',
            translated_languages: createRefundReasonDto.translated_languages || [],
        });

        return await this.refundReasonRepository.save(refundReason);
    }

    async findAllRefundReasons({
                                   search,
                                   limit = 10,
                                   page = 1,
                                   orderBy,
                                   sortedBy = 'DESC',
                                   language,
                               }: GetRefundReasonDto): Promise<any> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.refundReasonRepository.createQueryBuilder('refund_reason');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('(refund_reason.name ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (language) {
            queryBuilder.andWhere('refund_reason.language = :language', { language });
        }

        // Apply ordering
        const sortOrderString = sortedBy === 'ASC' ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`refund_reason.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('refund_reason.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/refund-reasons?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryRefundReasonsOrderByColumn): string {
        switch (orderBy) {
            case QueryRefundReasonsOrderByColumn.NAME:
                return 'name';
            case QueryRefundReasonsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryRefundReasonsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async getRefundReason(param: string, language?: string): Promise<RefundReason> {
        const queryBuilder = this.refundReasonRepository.createQueryBuilder('refund_reason')
            .where('refund_reason.slug = :param OR refund_reason.id = :param', { param });

        if (language) {
            queryBuilder.andWhere('refund_reason.language = :language', { language });
        }

        const refundReason = await queryBuilder.getOne();

        if (!refundReason) {
            throw new NotFoundException('Refund reason not found');
        }

        return refundReason;
    }

    async update(id: number, updateRefundReasonDto: UpdateRefundReasonDto): Promise<RefundReason> {
        const refundReason = await this.refundReasonRepository.findOne({
            where: { id },
        });

        if (!refundReason) {
            throw new NotFoundException('Refund reason not found');
        }

        // Update slug if name is changed
        let slug = refundReason.slug;
        if (updateRefundReasonDto.name && updateRefundReasonDto.name !== refundReason.name) {
            slug = generateSlug(updateRefundReasonDto.name);
        }

        // Update the entity properties
        if (updateRefundReasonDto.name) refundReason.name = updateRefundReasonDto.name;
        if (updateRefundReasonDto.language) refundReason.language = updateRefundReasonDto.language;
        if (updateRefundReasonDto.translated_languages) refundReason.translated_languages = updateRefundReasonDto.translated_languages;

        refundReason.slug = slug;

        return await this.refundReasonRepository.save(refundReason);
    }

    async remove(id: number): Promise<void> {
        const refundReason = await this.refundReasonRepository.findOneBy({ id });

        if (!refundReason) {
            throw new NotFoundException('Refund reason not found');
        }

        await this.refundReasonRepository.remove(refundReason);
    }
}