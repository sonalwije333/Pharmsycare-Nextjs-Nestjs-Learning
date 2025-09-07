// src/modules/coupons/dto/create-coupon.dto.ts
import { PickType } from '@nestjs/swagger';
import { Coupon } from '../entities/coupon.entity';

export class CreateCouponDto extends PickType(Coupon, [
    'code',
    'type',
    'description',
    'amount',
    'minimum_cart_amount',
    'image',
    'active_from',
    'expire_at',
    'target',
    'language',
    'shop_id',
]) {}