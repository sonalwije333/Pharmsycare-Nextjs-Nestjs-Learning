import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ShopsController,
  StaffsController,
  DisapproveShopController,
  ApproveShopController,
  NearByShopController,
  NewShopsController,
} from './shops.controller';
import { ShopsService } from './shops.service';
import { User } from '../users/entities/user.entity';
import { Permission } from '../users/entities/user.entity';
import { Shop } from './entites/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, User, Permission])],
  controllers: [
    ShopsController,
    StaffsController,
    DisapproveShopController,
    ApproveShopController,
    NearByShopController,
    NewShopsController,
  ],
  providers: [ShopsService],
  exports: [ShopsService],
})
export class ShopsModule {}
