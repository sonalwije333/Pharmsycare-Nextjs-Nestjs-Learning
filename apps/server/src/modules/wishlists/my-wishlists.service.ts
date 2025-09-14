import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto, WishlistPaginator } from './dto/get-wishlists.dto';
import { Product } from '../products/entities/product.entity';
import { QueryWishlistsOrderByColumn } from './dto/get-wishlists.dto';
import { SortOrder } from '../common/dto/generic-conditions.dto';
import {CreateWishlistDto} from "./dto/create-wishlists.dto";
import {UpdateWishlistDto} from "./dto/update-wishlists.dto";

@Injectable()
export class MyWishlistService {
    constructor(
        @InjectRepository(Wishlist)
        private readonly wishlistRepository: Repository<Wishlist>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async findMyWishlists({
                              page = 1,
                              limit = 30,
                              orderBy,
                              sortOrder = SortOrder.DESC
                          }: GetWishlistDto, userId: number): Promise<WishlistPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.wishlistRepository.createQueryBuilder('wishlist')
            .leftJoinAndSelect('wishlist.product', 'product')
            .leftJoinAndSelect('wishlist.user', 'user')
            .where('wishlist.user_id = :userId', { userId });

        // Apply ordering
        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`wishlist.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('wishlist.created_at', sortOrderString);
        }

        // Get count and results
        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/my-wishlists?with=user&orderBy=created_at&sortedBy=desc`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryWishlistsOrderByColumn): string {
        switch (orderBy) {
            case QueryWishlistsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryWishlistsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async findMyWishlist(id: number, userId: number): Promise<Wishlist> {
        const wishlist = await this.wishlistRepository.findOne({
            where: { id, user_id: userId },
            relations: ['product', 'user'],
        });

        if (!wishlist) {
            throw new NotFoundException(`Wishlist with ID ${id} not found or you don't have permission to access it`);
        }

        return wishlist;
    }

    async create(createWishlistDto: CreateWishlistDto, userId: number): Promise<Wishlist> {
        // Verify product exists
        const product = await this.productRepository.findOne({
            where: { id: String(createWishlistDto.product_id) }
        });


        if (!product) {
            throw new NotFoundException(`Product with ID ${createWishlistDto.product_id} not found`);
        }

        // Check if already in wishlist
        const existingWishlist = await this.wishlistRepository.findOne({
            where: {
                product_id: createWishlistDto.product_id,
                user_id: userId,
            },
        });

        if (existingWishlist) {
            return existingWishlist; // Already exists, return the existing one
        }

        const wishlist = this.wishlistRepository.create({
            product_id: createWishlistDto.product_id,
            user_id: userId,
        });

        return await this.wishlistRepository.save(wishlist);
    }

    async update(id: number, updateWishlistDto: UpdateWishlistDto, userId: number): Promise<Wishlist> {
        const wishlist = await this.wishlistRepository.findOne({
            where: { id, user_id: userId },
            relations: ['product', 'user'],
        });

        if (!wishlist) {
            throw new NotFoundException(`Wishlist with ID ${id} not found or you don't have permission to update it`);
        }

        // Verify product exists if product_id is being updated
        if (updateWishlistDto.product_id) {
            const product = await this.productRepository.findOne({
                where: { id: String(updateWishlistDto.product_id) }
            });

            if (!product) {
                throw new NotFoundException(`Product with ID ${updateWishlistDto.product_id} not found`);
            }
        }

        const updated = this.wishlistRepository.merge(wishlist, updateWishlistDto);
        return this.wishlistRepository.save(updated);
    }

    async delete(id: number, userId: number): Promise<void> {
        const wishlist = await this.wishlistRepository.findOne({
            where: { id, user_id: userId },
        });

        if (!wishlist) {
            throw new NotFoundException(`Wishlist with ID ${id} not found or you don't have permission to delete it`);
        }

        await this.wishlistRepository.remove(wishlist);
    }
}