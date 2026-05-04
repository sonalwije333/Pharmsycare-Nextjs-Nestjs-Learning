import { ApiProperty } from '@nestjs/swagger';

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
}

export enum CouponOrderByColumn {
  CREATED_AT = 'created_at',
  EXPIRE_AT = 'expire_at',
  ID = 'id',
  CODE = 'code',
  AMOUNT = 'amount',
  NAME = 'title',
  DESCRIPTION = 'description',
  MINIMUM_CART_AMOUNT = 'minimum_cart_amount',
  IS_APPROVE = 'is_approve',
  TYPE = 'type',
}