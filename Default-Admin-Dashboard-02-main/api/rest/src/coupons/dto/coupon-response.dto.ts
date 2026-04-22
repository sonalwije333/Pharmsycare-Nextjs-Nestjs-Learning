// coupons/dto/coupon-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Coupon } from '../entities/coupon.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class CouponResponse {
  @ApiProperty({ type: Coupon })
  coupon: Coupon;
}

export class CouponMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: Coupon, required: false })
  coupon?: Coupon;
}
