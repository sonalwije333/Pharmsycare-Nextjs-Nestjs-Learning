// products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ProductsController,
  PopularProductsController,
  ProductsStockController,
  DraftProductsController,
  BestSellingProductsController,
  ProductsExpiryController,
} from './products.controller';

@Module({
  controllers: [
    ProductsController,
    PopularProductsController,
    BestSellingProductsController,
    ProductsStockController,
    DraftProductsController,
    ProductsExpiryController,
  ],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}