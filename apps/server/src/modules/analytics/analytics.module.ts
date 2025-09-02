import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsController,
  CategoryWiseProductController,
  LowStockProductsController,
  TopRateProductController,
} from './analytics.controller';
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity';
import { CategoryWiseProduct } from './entities/category-wise-product.entity';
import { TopRateProduct } from './entities/top-rate-product.entity';
import { Product } from '../products/entities/product.entity';
import { Attachment } from '../common/entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Analytics,
      TotalYearSaleByMonth,
      CategoryWiseProduct,
      TopRateProduct,
      Product,
      Attachment,
    ]),
  ],
  controllers: [
    AnalyticsController,
    CategoryWiseProductController,
    LowStockProductsController,
    TopRateProductController,
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
