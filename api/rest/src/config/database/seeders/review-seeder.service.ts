// src/config/database/seeders/review-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Review } from '../../../reviews/entities/review.entity';
import { Product } from '../../../products/entities/product.entity';
import { User } from '../../../users/entities/user.entity';
import { Permission } from '../../../common/enums/enums';
import reviewJSON from '@db/reviews.json';
import productsJson from '../../../db/pickbazar/products.json';

// Pharmacy-appropriate demo review comments used when the legacy reviews.json
// has no entries matching the seeded medicine catalogue.
const DEMO_REVIEW_COMMENTS = [
  'Genuine product with sealed packaging and a good expiry date. Will order again.',
  'Fast delivery and exactly as described. Helped with my symptoms.',
  'Affordable and authentic. The pharmacist guidance was very helpful.',
  'Quick checkout and on-time delivery. Very satisfied with the service.',
  'Effective and reasonably priced. Thank you PharmSy-Care.',
  'Product matched the description. Packaging could be slightly better.',
  'Reliable medicine, delivered cold-chain safe. Highly recommended.',
];
const DEMO_REVIEW_RATINGS = [5, 4, 5, 3, 4, 5];

// PharmSy-Care is a pharmacy: only keep reviews for Medicine products.
const MEDICINE_PRODUCT_IDS = new Set<number>(
  (productsJson as any[])
    .filter((product: any) => product?.type?.slug === 'medicine')
    .map((product: any) => Number(product.id)),
);

@Injectable()
export class ReviewSeederService {
  private readonly logger = new Logger(ReviewSeederService.name);

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private getReviewsData(): Partial<Review>[] {
    const reviews = plainToClass(Review, reviewJSON as object[]);
    return reviews
      .filter((review: any) => MEDICINE_PRODUCT_IDS.has(Number(review.product_id)))
      .map((review: any) => ({
      id: review.id,
      user_id: review.user_id,
      product_id: review.product_id,
      variation_option_id: review.variation_option_id
        ? String(review.variation_option_id)
        : undefined,
      comment: review.comment,
      rating: review.rating,
      photos: review.photos || [],
      positive_feedbacks_count: review.positive_feedbacks_count || 0,
      negative_feedbacks_count: review.negative_feedbacks_count || 0,
      abusive_reports_count: review.abusive_reports_count || 0,
      created_at: review.created_at ? new Date(review.created_at) : new Date(),
      updated_at: review.updated_at ? new Date(review.updated_at) : new Date(),
    }));
  }

  private async createReviewIfNotExists(reviewData: Partial<Review>): Promise<boolean> {
    const existingReview = await this.reviewRepository.findOne({
      where: { id: reviewData.id },
    });

    if (existingReview) {
      return false;
    }

    const newReview = this.reviewRepository.create(reviewData);
    await this.reviewRepository.save(newReview);
    return true;
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting reviews seeding...');
      const reviews = this.getReviewsData();

      let createdCount = 0;
      for (const reviewData of reviews) {
        const created = await this.createReviewIfNotExists(reviewData);
        if (created) {
          createdCount++;
        }
      }

      this.logger.log(`Reviews seeding completed (${createdCount} created)`);

      // The legacy reviews.json references old catalogue ids; when nothing was
      // imported, generate demo reviews for the seeded medicine products so the
      // admin reviews list and shop product pages are populated.
      const existing = await this.reviewRepository.count();
      if (existing === 0) {
        await this.generateDemoReviews();
      }
    } catch (error) {
      this.logger.error('Error seeding reviews:', error);
      throw error;
    }
  }

  private async generateDemoReviews(): Promise<void> {
    const products = await this.productRepository.find({
      order: { id: 'ASC' },
      take: 25,
    });
    if (!products.length) {
      this.logger.warn('No products found; skipping demo review generation.');
      return;
    }

    const customers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.permissions LIKE :role', {
        role: `%${Permission.CUSTOMER}%`,
      })
      .getMany();
    const reviewerIds = customers.length
      ? customers.map((customer) => customer.id)
      : [2];

    const reviews: Review[] = [];
    let counter = 0;
    products.forEach((product, productIndex) => {
      // 1-2 reviews per product for variety.
      const reviewsForProduct = (productIndex % 2) + 1;
      for (let i = 0; i < reviewsForProduct; i++) {
        const rating = DEMO_REVIEW_RATINGS[counter % DEMO_REVIEW_RATINGS.length];
        const comment =
          DEMO_REVIEW_COMMENTS[counter % DEMO_REVIEW_COMMENTS.length];
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - (counter % 60));
        reviews.push(
          this.reviewRepository.create({
            rating,
            comment,
            user_id: reviewerIds[counter % reviewerIds.length],
            product_id: product.id,
            photos: [],
            positive_feedbacks_count: (counter * 3) % 11,
            negative_feedbacks_count: counter % 3,
            abusive_reports_count: 0,
            created_at: createdAt,
            updated_at: createdAt,
          }),
        );
        counter++;
      }
    });

    await this.reviewRepository.save(reviews);
    this.logger.log(`✅ Generated ${reviews.length} demo reviews for medicine products`);
  }

  async seedByProductId(productId: number): Promise<void> {
    try {
      this.logger.log(`Seeding reviews for product ID: ${productId}`);
      const reviews = this.getReviewsData().filter((r) => r.product_id === productId);

      let createdCount = 0;
      for (const reviewData of reviews) {
        const created = await this.createReviewIfNotExists(reviewData);
        if (created) {
          createdCount++;
        }
      }

      this.logger.log(
        `Reviews for product ${productId} seeding completed (${createdCount} created)`,
      );
    } catch (error) {
      this.logger.error(`Error seeding reviews for product ${productId}:`, error);
      throw error;
    }
  }

  async seedByUserId(userId: number): Promise<void> {
    try {
      this.logger.log(`Seeding reviews for user ID: ${userId}`);
      const reviews = this.getReviewsData().filter((r) => r.user_id === userId);

      let createdCount = 0;
      for (const reviewData of reviews) {
        const created = await this.createReviewIfNotExists(reviewData);
        if (created) {
          createdCount++;
        }
      }

      this.logger.log(
        `Reviews for user ${userId} seeding completed (${createdCount} created)`,
      );
    } catch (error) {
      this.logger.error(`Error seeding reviews for user ${userId}:`, error);
      throw error;
    }
  }

  async seedByRating(rating: number): Promise<void> {
    try {
      this.logger.log(`Seeding reviews with rating: ${rating}`);
      const reviews = this.getReviewsData().filter((r) => r.rating === rating);

      let createdCount = 0;
      for (const reviewData of reviews) {
        const created = await this.createReviewIfNotExists(reviewData);
        if (created) {
          createdCount++;
        }
      }

      this.logger.log(
        `Reviews with rating ${rating} seeding completed (${createdCount} created)`,
      );
    } catch (error) {
      this.logger.error(`Error seeding reviews with rating ${rating}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing reviews...');
      await this.reviewRepository.clear();
      this.logger.log('Reviews cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing reviews:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    averageRating: number;
    byRating: Record<number, number>;
    uniqueProducts: number;
    uniqueUsers: number;
  }> {
    const reviews = await this.reviewRepository.find();

    const byRating: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const uniqueProductsSet = new Set<number>();
    const uniqueUsersSet = new Set<number>();
    let totalRating = 0;

    for (const review of reviews) {
      byRating[review.rating] = (byRating[review.rating] || 0) + 1;
      uniqueProductsSet.add(review.product_id);
      uniqueUsersSet.add(review.user_id);
      totalRating += review.rating;
    }

    return {
      total: reviews.length,
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      byRating,
      uniqueProducts: uniqueProductsSet.size,
      uniqueUsers: uniqueUsersSet.size,
    };
  }
}