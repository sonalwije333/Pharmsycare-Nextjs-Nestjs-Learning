// shops/shops.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsService } from './shops.service';
import { Shop } from './entities/shop.entity';
import {
  ApproveShopController,
  DisapproveShopController,
  ShopsController,
  StaffsController,
  NearByShopController,
  NewShopsController,
} from './shops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  controllers: [
    ShopsController,
    StaffsController,
    DisapproveShopController,
    ApproveShopController,
    NearByShopController,
    NewShopsController,
  ],
  providers: [ShopsService],
})
export class ShopsModule {}