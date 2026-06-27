// analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsController,
  CategoryWiseProductController,
  LowStockProductsController,
  TopRateProductController,
} from './analytics.controller';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Shop, User])],
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
