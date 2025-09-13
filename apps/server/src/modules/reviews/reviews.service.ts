import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Review } from "./entities/review.entity";
import { Product } from "../products/entities/product.entity";

import { User } from "../users/entities/user.entity";
import { SortOrder } from "../common/dto/generic-conditions.dto";
import { GetReviewsDto, ReviewPaginator } from "./dto/get-reviews.dto";
import { paginate } from "../common/pagination/paginate";
import { QueryReviewsOrderByColumn } from "../../common/enums/enums";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import {Shop} from "../shops/entites/shop.entity";

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Shop)
        private readonly shopRepository: Repository<Shop>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAllReviews({
                             page = 1,
                             limit = 30,
                             search,
                             product_id,
                             shop_id,
                             rating_min,
                             rating_max,
                             language,
                             orderBy,
                             sortOrder = SortOrder.DESC
                         }: GetReviewsDto): Promise<ReviewPaginator> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.reviewRepository.createQueryBuilder('review')
            .leftJoinAndSelect('review.product', 'product')
            .leftJoinAndSelect('review.shop', 'shop')
            .leftJoinAndSelect('review.customer', 'customer')
            .leftJoinAndSelect('review.user', 'user');

        // Remove order relation since order module doesn't exist yet
        // .leftJoinAndSelect('review.order', 'order')

        if (search) {
            queryBuilder.andWhere('(review.comment ILIKE :search OR review.name ILIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (product_id) {
            queryBuilder.andWhere('review.product_id = :product_id', { product_id });
        }

        if (shop_id) {
            queryBuilder.andWhere('review.shop_id = :shop_id', { shop_id });
        }

        if (rating_min !== undefined && rating_max !== undefined) {
            queryBuilder.andWhere('review.rating BETWEEN :rating_min AND :rating_max', {
                rating_min,
                rating_max
            });
        } else if (rating_min !== undefined) {
            queryBuilder.andWhere('review.rating >= :rating_min', { rating_min });
        } else if (rating_max !== undefined) {
            queryBuilder.andWhere('review.rating <= :rating_max', { rating_max });
        }

        if (language) {
            queryBuilder.andWhere('review.language = :language', { language });
        }

        const sortOrderString = sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

        if (orderBy) {
            const column = this.getOrderByColumn(orderBy);
            queryBuilder.orderBy(`review.${column}`, sortOrderString);
        } else {
            queryBuilder.orderBy('review.created_at', sortOrderString);
        }

        const [results, total] = await queryBuilder
            .take(take)
            .skip(skip)
            .getManyAndCount();

        const url = `/reviews?search=${search ?? ''}&limit=${limit}`;
        const paginationInfo = paginate(total, page, limit, results.length, url);

        return {
            data: results,
            ...paginationInfo,
        };
    }

    private getOrderByColumn(orderBy: QueryReviewsOrderByColumn): string {
        switch (orderBy) {
            case QueryReviewsOrderByColumn.NAME:
                return 'name';
            case QueryReviewsOrderByColumn.UPDATED_AT:
                return 'updated_at';
            case QueryReviewsOrderByColumn.CREATED_AT:
            default:
                return 'created_at';
        }
    }

    async findReview(id: number): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id: id },
            relations: ['product', 'shop', 'customer', 'user']
            // Remove order relation since order module doesn't exist yet
        });

        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }

        return review;
    }

    async create(createReviewDto: CreateReviewDto): Promise<Review> {
        // Convert string IDs to numbers for database lookup
        const productId = parseInt(createReviewDto.product_id, 10);
        const shopId = parseInt(createReviewDto.shop_id, 10);
        const userId = parseInt(createReviewDto.user_id, 10);

        const [product, shop, user] = await Promise.all([
            this.productRepository.findOne({ where: { id: productId.toString() } }),
            this.shopRepository.findOne({ where: { id: shopId } }),
            this.userRepository.findOne({ where: { id: userId } }) // Use number ID
        ]);

        if (!product) {
            throw new NotFoundException(`Product with ID ${createReviewDto.product_id} not found`);
        }
        if (!shop) {
            throw new NotFoundException(`Shop with ID ${createReviewDto.shop_id} not found`);
        }
        if (!user) {
            throw new NotFoundException(`User with ID ${createReviewDto.user_id} not found`);
        }

        // Create review data without order
        const reviewData: Partial<Review> = {
            rating: Math.min(Math.max(createReviewDto.rating, 1), 5),
            name: user.name,
            comment: createReviewDto.comment,
            product,
            shop,
            user,
            customer: user,
            language: createReviewDto.language || 'en',
            translatedLanguages: createReviewDto.translated_languages || [],
            userId: user.id,
            productId: Number(product.id),
            shopId: shop.id.toString(),
        };

        const review = this.reviewRepository.create(reviewData);
        return await this.reviewRepository.save(review);
    }

    async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id: id },
            relations: ['product', 'shop', 'user']
            // Remove order relation
        });

        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }

        // Update fields manually to avoid type issues
        if (updateReviewDto.rating !== undefined) {
            review.rating = Math.min(Math.max(updateReviewDto.rating, 1), 5);
        }
        if (updateReviewDto.comment !== undefined) {
            review.comment = updateReviewDto.comment;
        }
        if (updateReviewDto.language !== undefined) {
            review.language = updateReviewDto.language;
        }
        if (updateReviewDto.translated_languages !== undefined) {
            review.translatedLanguages = updateReviewDto.translated_languages;
        }

        return await this.reviewRepository.save(review);
    }

    async delete(id: number): Promise<void> {
        const review = await this.reviewRepository.findOne({
            where: { id: id }
        });

        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }

        // Use JavaScript property name
        review.deletedAt = new Date();
        await this.reviewRepository.save(review);
    }
}