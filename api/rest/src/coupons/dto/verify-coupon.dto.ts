// coupons/dto/verify-coupon.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Coupon } from '../entities/coupon.entity';

export class VerifyCouponInput {
  @ApiProperty({ description: 'Coupon code', example: '5OFF' })
  code: string;
}

export class VerifyCouponResponse {
  @ApiProperty({ description: 'Is coupon valid', example: true })
  is_valid: boolean;

  @ApiProperty({ type: Coupon, description: 'Coupon details', nullable: true })
  coupon: Coupon | null;
}
