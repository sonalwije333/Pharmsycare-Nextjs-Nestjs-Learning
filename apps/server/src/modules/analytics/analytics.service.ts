import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
//import * as Sentry from '@sentry/node';
import { Analytics } from './entities/analytics.entity';
import { CategoryWiseProduct } from './entities/category-wise-product.entity';
import { TopRateProduct } from './entities/top-rate-product.entity';
import { Product } from '../products/entities/product.entity';
import { GetAnalyticsDto } from './dto/get-analytics.dto';
import { AnalyticsPeriod } from '../../common/enums/enums';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
    @InjectRepository(CategoryWiseProduct)
    private readonly categoryWiseProductRepository: Repository<CategoryWiseProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(TopRateProduct)
    private readonly topRateProductRepository: Repository<TopRateProduct>,
  ) {}

  async findAll(getAnalyticsDto?: GetAnalyticsDto): Promise<Analytics> {
    try {
      let whereCondition = {};

      if (getAnalyticsDto?.startDate && getAnalyticsDto?.endDate) {
        whereCondition = {
          created_at: Between(
            new Date(getAnalyticsDto.startDate),
            new Date(getAnalyticsDto.endDate),
          ),
        };
      } else if (getAnalyticsDto?.period) {
        const date = new Date();
        let startDate: Date;

        switch (getAnalyticsDto.period) {
          case AnalyticsPeriod.DAY:
            startDate = new Date(date.setDate(date.getDate() - 1));
            break;
          case AnalyticsPeriod.WEEK:
            startDate = new Date(date.setDate(date.getDate() - 7));
            break;
          case AnalyticsPeriod.MONTH:
            startDate = new Date(date.setMonth(date.getMonth() - 1));
            break;
          case AnalyticsPeriod.YEAR:
            startDate = new Date(date.setFullYear(date.getFullYear() - 1));
            break;
          default:
            startDate = new Date(date.setMonth(date.getMonth() - 1));
        }

        whereCondition = {
          created_at: MoreThanOrEqual(startDate),
        };
      }

      const analytics = await this.analyticsRepository.findOne({
        where: whereCondition,
        relations: ['totalYearSaleByMonth'],
        order: { created_at: 'DESC' },
      });

      if (!analytics) {
        throw new NotFoundException('Analytics data not found');
      }

      return analytics;
    } catch (error) {
      //Sentry.captureException(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch analytics data');
    }
  }

  async findAllCategoryWiseProduct(): Promise<CategoryWiseProduct[]> {
    try {
      const categoryProducts = await this.categoryWiseProductRepository.find({
        order: { totalRevenue: 'DESC' },
      });

      if (!categoryProducts.length) {
        throw new NotFoundException('Category-wise product data not found');
      }

      return categoryProducts;
    } catch (error) {
     // Sentry.captureException(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch category-wise product data',
      );
    }
  }

  async findAllLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const lowStockProducts = await this.productRepository.find({
        where: {
          quantity: LessThanOrEqual(threshold),
          // is_active: true
        },
        relations: ['image', 'shop'],
        order: { quantity: 'ASC' },
      });

      if (!lowStockProducts.length) {
        throw new NotFoundException('No low stock products found');
      }

      return lowStockProducts;
    } catch (error) {
     // Sentry.captureException(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch low stock products',
      );
    }
  }

  async findAllTopRateProduct(limit: number = 10): Promise<TopRateProduct[]> {
    try {
      const topRatedProducts = await this.topRateProductRepository.find({
        where: { rating_count: MoreThanOrEqual(5) },
        order: { actual_rating: 'DESC', rating_count: 'DESC' },
        take: limit,
        relations: ['image'],
      });

      if (!topRatedProducts.length) {
        throw new NotFoundException('No top-rated products found');
      }

      return topRatedProducts;
    } catch (error) {
      // Sentry.captureException(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch top-rated products',
      );
    }
  }

  async generateDailyAnalytics(): Promise<void> {
    try {
      // Implementation for generating daily analytics
      // This would typically be called by a scheduled task
      const analyticsData = new Analytics();
      // Populate analytics data from various sources
      await this.analyticsRepository.save(analyticsData);
    } catch (error) {
     // Sentry.captureException(error);
      throw new InternalServerErrorException(
        'Failed to generate daily analytics',
      );
    }
  }
}
