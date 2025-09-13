import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundPolicy } from './entities/refund-policies.entity';
import { CreateRefundPolicyDto } from './dto/create-refund-policy.dto';
import { GetRefundPolicyDto } from './dto/get-refund-policies.dto';
import { UpdateRefundPolicyDto } from './dto/update-refund-policy.dto';
import { paginate } from '../common/pagination/paginate';
import { generateSlug } from '../../utils/generate-slug';
import { Shop } from '../shops/entites/shop.entity';
import { SortOrder } from "../common/dto/generic-conditions.dto";
import { QueryRefundPoliciesOrderByColumn } from "../../common/enums/enums";

@Injectable()
export class RefundPoliciesService {
    constructor(
        @InjectRepository(RefundPolicy)
        private refundPolicyRepository: Repository<RefundPolicy>,
        @InjectRepository(Shop)
        private shopRepository: Repository<Shop>,
    ) {}

    async create(createRefundPolicyDto: CreateRefundPolicyDto): Promise<RefundPolicy> {
        const slug = generateSlug(createRefundPolicyDto.title);

        let shop: Shop | null = null;
        if (createRefundPolicyDto.shop_id) {
            shop = await this.shopRepository.findOne({
                where: { id: Number(createRefundPolicyDto.shop_id) }
            });
            if (!shop) {
                throw new NotFoundException(`Shop with id ${createRefundPolicyDto.shop_id} not found`);
            }
        }

        // Create the entity using object assignment instead of repository.create()
        const refundPolicy = new RefundPolicy();
        Object.assign(refundPolicy, {
            ...createRefundPolicyDto,
            slug,
            shop,
            language: createRefundPolicyDto.language || 'en',
            translated_languages: createRefundPolicyDto.translated_languages || [],
        });

        return await this.refundPolicyRepository.save(refundPolicy);
    }

    async findAllRefundPolicies({
                                    search,
                                    limit = 10,
                                    page = 1,
                                    orderBy,
                                    sortedBy = SortOrder.DESC,
                                    language,
                                    status,
                                }: GetRefundPolicyDto): Promise<any> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.refundPolicyRepository.createQueryBuilder('refund_policy')
            .leftJoinAndSelect('refund_policy.shop', 'shop');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('(refund_policy.title ILIKE :search OR refund_policy.description ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (language) {
            queryBuilder.andWhere('refund_policy.language = :language', { language });
        }

        if (status) {
            queryBuilder.andWhere('refund_policy.status = :status', { status });
        }

        const sortOrderString = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`refund_policy.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('refund_policy.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/refund-policies?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryRefundPoliciesOrderByColumn): string {
        switch (orderBy) {
            case QueryRefundPoliciesOrderByColumn.TITLE:
                return 'title';
            case QueryRefundPoliciesOrderByColumn.STATUS:
                return 'status';
            case QueryRefundPoliciesOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryRefundPoliciesOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async getRefundPolicy(param: string, language?: string): Promise<RefundPolicy> {
        const queryBuilder = this.refundPolicyRepository.createQueryBuilder('refund_policy')
            .leftJoinAndSelect('refund_policy.shop', 'shop')
            .where('refund_policy.slug = :param OR refund_policy.id = :param', { param });

        if (language) {
            queryBuilder.andWhere('refund_policy.language = :language', { language });
        }

        const refundPolicy = await queryBuilder.getOne();

        if (!refundPolicy) {
            throw new NotFoundException('Refund policy not found');
        }

        return refundPolicy;
    }

    async update(id: number, updateRefundDto: UpdateRefundPolicyDto): Promise<RefundPolicy> {
        const refundPolicy = await this.refundPolicyRepository.findOne({
            where: { id },
            relations: ['shop'],
        });

        if (!refundPolicy) {
            throw new NotFoundException('Refund policy not found');
        }

        // Update slug if title is changed
        let slug = refundPolicy.slug;
        if (updateRefundDto.title && updateRefundDto.title !== refundPolicy.title) {
            slug = generateSlug(updateRefundDto.title);
        }

        // Update shop if shop_id is provided
        let shop = refundPolicy.shop;
        if (updateRefundDto.shop_id) {
            const foundShop = await this.shopRepository.findOne({
                where: { id: Number(updateRefundDto.shop_id) }
            });
            if (!foundShop) {
                throw new NotFoundException(`Shop with id ${updateRefundDto.shop_id} not found`);
            }
            shop = foundShop;
        }

        // Update the entity properties
        if (updateRefundDto.title) refundPolicy.title = updateRefundDto.title;
        if (updateRefundDto.status) refundPolicy.status = updateRefundDto.status;
        if (updateRefundDto.target) refundPolicy.target = updateRefundDto.target;
        if (updateRefundDto.description !== undefined) refundPolicy.description = updateRefundDto.description;
        if (updateRefundDto.language) refundPolicy.language = updateRefundDto.language;
        if (updateRefundDto.translated_languages) refundPolicy.translated_languages = updateRefundDto.translated_languages;

        refundPolicy.slug = slug;
        refundPolicy.shop = shop;

        return await this.refundPolicyRepository.save(refundPolicy);
    }

    async remove(id: number): Promise<void> {
        const refundPolicy = await this.refundPolicyRepository.findOneBy({ id });

        if (!refundPolicy) {
            throw new NotFoundException('Refund policy not found');
        }

        await this.refundPolicyRepository.remove(refundPolicy);
    }
}