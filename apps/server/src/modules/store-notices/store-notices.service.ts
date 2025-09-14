// src/modules/store-notices/store-notices.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In, FindOptionsWhere } from 'typeorm';
import { CreateStoreNoticeDto } from './dto/create-store-notice.dto';
import { UpdateStoreNoticeDto } from './dto/update-store-notice.dto';
import { GetStoreNoticesDto } from './dto/get-store-notices.dto';
import { StoreNotice } from './entities/store-notices.entity';

import { User } from '../users/entities/user.entity';
import { paginate } from '../common/pagination/paginate';
import {Shop} from "../shops/entites/shop.entity";

@Injectable()
export class StoreNoticesService {
    constructor(
        @InjectRepository(StoreNotice)
        private readonly storeNoticeRepository: Repository<StoreNotice>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createStoreNoticeDto: CreateStoreNoticeDto, createdBy: User): Promise<StoreNotice> {
        const storeNotice = this.storeNoticeRepository.create({
            ...createStoreNoticeDto,
            created_by: createdBy,
        });

        // Handle shop relationships
        if (createStoreNoticeDto.shop_ids?.length) {
            const shops = await this.shopRepository.findBy({
                id: In(createStoreNoticeDto.shop_ids)
            });
            storeNotice.shops = shops;
        }

        // Handle user relationships
        if (createStoreNoticeDto.user_ids?.length) {
            const users = await this.userRepository.findBy({
                id: In(createStoreNoticeDto.user_ids)
            });
            storeNotice.users = users;
        }

        return await this.storeNoticeRepository.save(storeNotice);
    }

    async getStoreNotices(getStoreNoticesDto: GetStoreNoticesDto): Promise<any> {
        const page = getStoreNoticesDto.page ?? 1;
        const limit = getStoreNoticesDto.limit ?? 12;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<StoreNotice> = {};

        if (getStoreNoticesDto.search) {
            where.notice = ILike(`%${getStoreNoticesDto.search}%`);
        }

        if (getStoreNoticesDto.language) {
            where.translated_languages = ILike(`%${getStoreNoticesDto.language}%`);
        }

        let order: any = { created_at: 'DESC' };
        if (getStoreNoticesDto.orderBy && getStoreNoticesDto.sortedBy) {
            const orderField = this.getOrderByField(getStoreNoticesDto.orderBy);
            order = { [orderField]: getStoreNoticesDto.sortedBy };
        }

        const [data, total] = await this.storeNoticeRepository.findAndCount({
            where,
            relations: ['created_by', 'shops', 'users'],
            skip,
            take: limit,
            order,
        });

        const url = `/store-notices?search=${getStoreNoticesDto.search}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, data.length, url);

        return {
            data,
            ...paginationInfo,
        };
    }

    private getOrderByField(orderBy: string): string {
        switch (orderBy) {
            case 'NOTICE': return 'notice';
            case 'DESCRIPTION': return 'description';
            case 'TYPE': return 'type';
            case 'PRIORITY': return 'priority';
            case 'EXPIRED_AT': return 'expired_at';
            case 'CREATED_AT': return 'created_at';
            default: return 'created_at';
        }
    }

    async getStoreNotice(id: number): Promise<StoreNotice> {
        const storeNotice = await this.storeNoticeRepository.findOne({
            where: { id },
            relations: ['created_by', 'shops', 'users'],
        });

        if (!storeNotice) {
            throw new NotFoundException(`Store notice with ID ${id} not found`);
        }

        return storeNotice;
    }

    async update(id: number, updateStoreNoticeDto: UpdateStoreNoticeDto): Promise<StoreNotice> {
        const storeNotice = await this.storeNoticeRepository.findOne({
            where: { id },
            relations: ['shops', 'users'],
        });

        if (!storeNotice) {
            throw new NotFoundException(`Store notice with ID ${id} not found`);
        }

        // Update basic fields
        Object.assign(storeNotice, updateStoreNoticeDto);

        // Update shop relationships
        if (updateStoreNoticeDto.shop_ids !== undefined) {
            const shops = updateStoreNoticeDto.shop_ids?.length
                ? await this.shopRepository.findBy({ id: In(updateStoreNoticeDto.shop_ids) })
                : [];
            storeNotice.shops = shops;
        }

        // Update user relationships
        if (updateStoreNoticeDto.user_ids !== undefined) {
            const users = updateStoreNoticeDto.user_ids?.length
                ? await this.userRepository.findBy({ id: In(updateStoreNoticeDto.user_ids) })
                : [];
            storeNotice.users = users;
        }

        return await this.storeNoticeRepository.save(storeNotice);
    }

    async remove(id: number): Promise<void> {
        const storeNotice = await this.storeNoticeRepository.findOne({
            where: { id }
        });

        if (!storeNotice) {
            throw new NotFoundException(`Store notice with ID ${id} not found`);
        }

        await this.storeNoticeRepository.remove(storeNotice);
    }

    async markAsRead(id: number, userId: number): Promise<StoreNotice> {
        const storeNotice = await this.storeNoticeRepository.findOne({
            where: { id },
            relations: ['users'],
        });

        if (!storeNotice) {
            throw new NotFoundException(`Store notice with ID ${id} not found`);
        }

        // Implementation for marking as read would depend on your business logic
        // This is a placeholder implementation
        storeNotice.is_read = true;

        return await this.storeNoticeRepository.save(storeNotice);
    }
}