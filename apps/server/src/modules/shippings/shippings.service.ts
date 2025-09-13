import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetShippingsDto, ShippingPaginator } from './dto/get-shippings.dto';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Shipping } from './entities/shipping.entity';

import { SortOrder } from '../common/dto/generic-conditions.dto';
import { paginate } from '../common/pagination/paginate';
import { ShippingNotFoundException } from './exceptions/shipping-not-found.exception';
import {QueryShippingClassesOrderByColumn} from "../../common/enums/enums";

@Injectable()
export class ShippingsService {
    constructor(
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
    ) {}

    async create(createShippingDto: CreateShippingDto): Promise<Shipping> {
        const shipping = this.shippingRepository.create(createShippingDto);
        return await this.shippingRepository.save(shipping);
    }

    async getShippings({
                           page = 1,
                           limit = 30,
                           search,
                           type,
                           is_global,
                           orderBy,
                           sortOrder = SortOrder.DESC
                       }: GetShippingsDto): Promise<ShippingPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.shippingRepository.createQueryBuilder('shipping');

        // Apply filters
        if (search) {
            queryBuilder.andWhere('shipping.name ILIKE :search', {
                search: `%${search}%`,
            });
        }

        if (type) {
            queryBuilder.andWhere('shipping.type = :type', { type });
        }

        if (is_global !== undefined) {
            queryBuilder.andWhere('shipping.is_global = :is_global', { is_global });
        }

        // Apply ordering
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`shipping.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('shipping.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/shippings?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryShippingClassesOrderByColumn): string {
        switch (orderBy) {
            case QueryShippingClassesOrderByColumn.NAME:
                return 'name';
            case QueryShippingClassesOrderByColumn.AMOUNT:
                return 'amount';
            case QueryShippingClassesOrderByColumn.IS_GLOBAL:
                return 'is_global';
            case QueryShippingClassesOrderByColumn.TYPE:
                return 'type';
            case QueryShippingClassesOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryShippingClassesOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async findOne(id: number): Promise<Shipping> {
        const shipping = await this.shippingRepository.findOne({
            where: { id },
        });

        if (!shipping) {
            throw new ShippingNotFoundException(id);
        }

        return shipping;
    }

    async update(id: number, updateShippingDto: UpdateShippingDto): Promise<Shipping> {
        const shipping = await this.findOne(id);

        const updated = this.shippingRepository.merge(shipping, updateShippingDto);
        return this.shippingRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const shipping = await this.findOne(id);

        // Soft delete implementation
        shipping.deleted_at = new Date();
        await this.shippingRepository.save(shipping);
    }
}