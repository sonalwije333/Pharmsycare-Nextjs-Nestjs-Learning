import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate } from '../common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto, WishlistPaginator } from './dto/get-wishlists.dto';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { QueryWishlistsOrderByColumn } from './dto/get-wishlists.dto';
import { SortOrder } from '../common/dto/generic-conditions.dto';
import {CreateWishlistDto} from "./dto/create-wishlists.dto";
import {UpdateWishlistDto} from "./dto/update-wishlists.dto";

@Injectable()
export class WishlistsService {
    constructor(
        @InjectRepository(Wishlist)
        private readonly wishlistRepository: Repository<Wishlist>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAllWishlists({
                               page = 1,
                               limit = 30,
                               user_id,
                               product_id,
                               orderBy,
                               sortOrder = SortOrder.DESC
                           }: GetWishlistDto): Promise<WishlistPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.wishlistRepository.createQueryBuilder('wishlist')
            .leftJoinAndSelect('wishlist.product', 'product')
            .leftJoinAndSelect('wishlist.user', 'user');

        // Apply filters
        if (user_id) {
            queryBuilder.andWhere('wishlist.user_id = :user_id', { user_id });
        }

        if (product_id) {
            queryBuilder.andWhere('wishlist.product_id = :product_id', { product_id });
        }

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

        const url = `/wishlists?limit=${limit}`;
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

    async findWishlist(id: number): Promise<Wishlist> {
        const wishlist = await this.wishlistRepository.findOne({
            where: { id },
            relations: ['product', 'user'],
        });

        if (!wishlist) {
            throw new NotFoundException(`Wishlist with ID ${id} not found`);
        }

        return wishlist;
    }

    async create(createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
        // Verify product exists
        const product = await this.productRepository.findOne({
            where: { id: String(createWishlistDto.product_id) }
        });


        if (!product) {
            throw new NotFoundException(`Product with ID ${createWishlistDto.product_id} not found`);
        }

        // Verify user exists
        const user = await this.userRepository.findOne({
            where: { id: createWishlistDto.user_id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${createWishlistDto.user_id} not found`);
        }

        // Check if already in wishlist
        const existingWishlist = await this.wishlistRepository.findOne({
            where: {
                product_id: createWishlistDto.product_id,
                user_id: createWishlistDto.user_id,
            },
        });

        if (existingWishlist) {
            return existingWishlist; // Already exists, return the existing one
        }

        const wishlist = this.wishlistRepository.create({
            product_id: createWishlistDto.product_id,
            user_id: createWishlistDto.user_id,
        });

        return await this.wishlistRepository.save(wishlist);
    }

    async update(id: number, updateWishlistDto: UpdateWishlistDto): Promise<Wishlist> {
        const wishlist = await this.wishlistRepository.findOne({
            where: { id },
            relations: ['product', 'user'],
        });

        if (!wishlist) {
            throw new NotFoundException(`Wishlist with ID ${id} not found`);
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

        // Verify user exists if user_id is being updated
        if (updateWishlistDto.user_id) {
            const user = await this.userRepository.findOne({
                where: { id: updateWishlistDto.user_id },
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${updateWishlistDto.user_id} not found`);
            }
        }

        const updated = this.wishlistRepository.merge(wishlist, updateWishlistDto);
        return this.wishlistRepository.save(updated);
    }

    async delete(id: number): Promise<void> {
        const wishlist = await this.wishlistRepository.findOneBy({ id });

        if (!wishlist) {
            throw new NotFoundException(`Wishlist with ID ${id} not found`);
        }

        await this.wishlistRepository.remove(wishlist);
    }

    async isInWishlist(product_id: number, user_id: number): Promise<boolean> {
        const wishlist = await this.wishlistRepository.findOne({
            where: {
                product_id,
                user_id,
            },
        });

        return !!wishlist;
    }

    async toggle(createWishlistDto: CreateWishlistDto): Promise<boolean> {
        const existingWishlist = await this.wishlistRepository.findOne({
            where: {
                product_id: createWishlistDto.product_id,
                user_id: createWishlistDto.user_id,
            },
        });

        if (existingWishlist) {
            // Remove from wishlist
            await this.wishlistRepository.remove(existingWishlist);
            return false;
        } else {
            // Add to wishlist
            await this.create(createWishlistDto);
            return true;
        }
    }
}