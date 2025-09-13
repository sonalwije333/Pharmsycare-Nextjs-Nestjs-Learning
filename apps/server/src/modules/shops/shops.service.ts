// src/modules/shops/shops.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Withdraw } from '../withdraws/entities/withdraw.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetShopsDto } from './dto/get-shops.dto';
import { ApproveShopDto } from './dto/approve-shop.dto';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { ShopPaginator } from './dto/shop-paginator.dto';
import { paginate } from '../common/pagination/paginate';
import { Shop } from "./entites/shop.entity";
import { QueryShopsOrderByColumn } from "../../common/enums/enums";
import { SortOrder } from "../common/dto/generic-conditions.dto";

@Injectable()
export class ShopsService {
    constructor(
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Withdraw)
        private readonly withdrawRepository: Repository<Withdraw>,
    ) {}

    async create(createShopDto: CreateShopDto, userId: number): Promise<Shop> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const existingShop = await this.shopRepository.findOne({
            where: { owner: { id: userId } }
        });
        if (existingShop) {
            throw new ConflictException('User already has a shop');
        }

        const slugExists = await this.shopRepository.findOne({
            where: { slug: createShopDto.slug }
        });
        if (slugExists) {
            throw new ConflictException('Shop slug already exists');
        }

        const shop = this.shopRepository.create({
            ...createShopDto,
            owner: user,
            is_active: false,
        });

        return await this.shopRepository.save(shop);
    }

    async getShopsPaginated(getShopsDto: GetShopsDto): Promise<ShopPaginator> {
        const page = getShopsDto.page ?? 1;
        const limit = getShopsDto.limit ?? 10;
        const sortedBy = getShopsDto.sortedBy ?? SortOrder.DESC;

        const skip = (page - 1) * limit;
        const take = limit;

        const where: any = {};
        if (getShopsDto.is_active !== undefined) {
            where.is_active = getShopsDto.is_active;
        }

        if (getShopsDto.text) {
            where.name = ILike(`%${getShopsDto.text}%`);
        }

        if (getShopsDto.search) {
            const searchParams = getShopsDto.search.split(';');
            for (const searchParam of searchParams) {
                const [key, value] = searchParam.split(':');
                if (key && value) {
                    where[key] = ILike(`%${value}%`);
                }
            }
        }

        let order: any = { created_at: 'DESC' };
        if (getShopsDto.orderBy && sortedBy) {
            order = {};
            const orderField = this.getOrderByField(getShopsDto.orderBy);
            order[orderField] = sortedBy === SortOrder.ASC ? 'ASC' : 'DESC';
        }

        const [data, total] = await this.shopRepository.findAndCount({
            where,
            relations: ['owner'],
            skip,
            take,
            order,
        });

        const url = `/shops?limit=${limit}&page=${page}`;
        const paginationInfo = paginate(total, page, limit, data.length, url);

        return {
            data,
            paginatorInfo: paginationInfo,
        };
    }

    private getOrderByField(orderBy: QueryShopsOrderByColumn): string {
        switch (orderBy) {
            case QueryShopsOrderByColumn.NAME:
                return 'name';
            case QueryShopsOrderByColumn.CREATED_AT:
                return 'created_at';
            case QueryShopsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryShopsOrderByColumn.IS_ACTIVE:
                return 'is_active';
            case QueryShopsOrderByColumn.BALANCE:
                return 'balance';
            default:
                return 'created_at';
        }
    }

    async getShopBySlug(slug: string): Promise<Shop> {
        const shop = await this.shopRepository.findOne({
            where: { slug },
            relations: ['owner', 'withdraws'],
        });

        if (!shop) {
            throw new NotFoundException(`Shop with slug ${slug} not found`);
        }

        return shop;
    }

    async getShopById(id: number): Promise<Shop> {
        const shop = await this.shopRepository.findOne({
            where: { id },
            relations: ['owner', 'withdraws'],
        });

        if (!shop) {
            throw new NotFoundException(`Shop with ID ${id} not found`);
        }

        return shop;
    }

    async update(id: number, updateShopDto: UpdateShopDto, userId: number): Promise<Shop> {
        const shop = await this.shopRepository.findOne({
            where: { id },
            relations: ['owner'],
        });

        if (!shop) {
            throw new NotFoundException(`Shop with ID ${id} not found`);
        }

        if (shop.owner.id !== userId) {
            throw new ConflictException('You can only update your own shop');
        }

        if (updateShopDto.slug && updateShopDto.slug !== shop.slug) {
            const slugExists = await this.shopRepository.findOne({
                where: { slug: updateShopDto.slug }
            });
            if (slugExists) {
                throw new ConflictException('Shop slug already exists');
            }
        }

        Object.assign(shop, updateShopDto);
        return await this.shopRepository.save(shop);
    }

    async remove(id: number, userId: number): Promise<void> {
        const shop = await this.shopRepository.findOne({
            where: { id },
            relations: ['owner'],
        });

        if (!shop) {
            throw new NotFoundException(`Shop with ID ${id} not found`);
        }

        if (shop.owner.id !== userId) {
            throw new ConflictException('You can only delete your own shop');
        }

        await this.shopRepository.remove(shop);
    }

    async approveShop(approveShopDto: ApproveShopDto): Promise<Shop> {
        const shop = await this.shopRepository.findOne({
            where: { id: parseInt(approveShopDto.id) }
        });

        if (!shop) {
            throw new NotFoundException(`Shop with ID ${approveShopDto.id} not found`);
        }

        shop.is_active = true;
        // JSON settings removed - if you need to store commission rate, add a dedicated column
        // shop.admin_commission_rate = approveShopDto.admin_commission_rate;

        return await this.shopRepository.save(shop);
    }

    async disapproveShop(id: number): Promise<Shop> {
        const shop = await this.shopRepository.findOne({
            where: { id }
        });

        if (!shop) {
            throw new NotFoundException(`Shop with ID ${id} not found`);
        }

        shop.is_active = false;
        return await this.shopRepository.save(shop);
    }

    async getShopStaff(getStaffsDto: GetStaffsDto): Promise<any> {
        const page = getStaffsDto.page ?? 1;
        const limit = getStaffsDto.limit ?? 10;

        if (!getStaffsDto.shop_id) {
            throw new BadRequestException('Shop ID is required');
        }

        const shopId = parseInt(getStaffsDto.shop_id);

        const [staff, total] = await this.userRepository.findAndCount({
            where: { managed_shop: { id: shopId } },
            relations: ['permissions', 'profile'],
            skip: (page - 1) * limit,
            take: limit,
        });

        const url = `/shops/staffs?shop_id=${getStaffsDto.shop_id}&limit=${limit}&page=${page}`;
        const paginationInfo = paginate(total, page, limit, staff.length, url);

        return {
            data: staff,
            paginatorInfo: paginationInfo,
        };
    }

    async getNearbyShops(lat: number, lng: number, radius: number): Promise<Shop[]> {
        if (!lat || !lng) {
            throw new BadRequestException('Latitude and longitude are required');
        }

        const shops = await this.shopRepository.find({
            where: { is_active: true },
            relations: ['owner'],
            take: 20,
        });

        return shops;
    }

    async getNewShops(limit: number): Promise<Shop[]> {
        const shops = await this.shopRepository.find({
            where: { is_active: true },
            order: { created_at: 'DESC' },
            take: limit,
            relations: ['owner'],
        });

        return shops;
    }

    async getShopByOwnerId(ownerId: number): Promise<Shop> {
        const shop = await this.shopRepository.findOne({
            where: { owner: { id: ownerId } },
            relations: ['owner', 'withdraws'],
        });

        if (!shop) {
            throw new NotFoundException(`Shop for owner with ID ${ownerId} not found`);
        }

        return shop;
    }

    async updateShopBalance(shopId: number, amount: number): Promise<Shop> {
        const shop = await this.shopRepository.findOne({
            where: { id: shopId }
        });

        if (!shop) {
            throw new NotFoundException(`Shop with ID ${shopId} not found`);
        }

        shop.balance = Number(shop.balance) + amount;
        return await this.shopRepository.save(shop);
    }
}