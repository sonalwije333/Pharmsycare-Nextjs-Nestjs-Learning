// coupons/coupons.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsService } from './coupons.service';
import {
  ApproveCouponController,
  CouponsController,
  DisapproveCouponController,
} from './coupons.controller';
import { Coupon } from './entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  controllers: [
    CouponsController,
    ApproveCouponController,
    DisapproveCouponController,
  ],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
