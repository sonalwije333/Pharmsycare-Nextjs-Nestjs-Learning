// src/modules/coupons/dto/verify-coupon.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Coupon } from '../entities/coupon.entity';

export class VerifyCouponInput {
    @ApiProperty({ description: 'Coupon code to verify', example: 'SUMMER2023' })
    @IsNotEmpty()
    @IsString()
    code: string;
}

export class VerifyCouponResponse {
    @ApiProperty({ description: 'Whether the coupon is valid', example: true })
    is_valid: boolean;

    @ApiProperty({ description: 'Coupon details', type: Coupon })
    coupon: Coupon;
}