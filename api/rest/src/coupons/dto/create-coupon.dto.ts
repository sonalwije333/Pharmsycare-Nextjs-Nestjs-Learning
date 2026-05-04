import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from 'src/common/enums/coupon-type.enum';


export class CreateCouponDto {
  @ApiProperty({ 
    description: 'Coupon code', 
    example: '5OFF',
    type: String,
  })
  @IsString()
  code: string;

  @ApiProperty({
    enum: CouponType,
    description: 'Coupon type',
    example: CouponType.FIXED,
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ 
    description: 'Coupon description', 
    required: false,
    type: String,
    example: 'Save $5 on your next purchase',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Discount amount', 
    example: 5,
    type: Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({ 
    description: 'Minimum cart amount', 
    example: 0,
    type: Number,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  minimum_cart_amount?: number = 0;

  @ApiProperty({
    type: 'object',
    description: 'Coupon image',
    required: false,
    properties: {
      thumbnail: { type: 'string', example: 'https://example.com/thumb.jpg' },
      original: { type: 'string', example: 'https://example.com/original.jpg' },
    },
  })
  @IsOptional()
  image?: Record<string, string>;

  @ApiProperty({
    description: 'Active from date',
    example: '2021-03-28T05:46:42.000Z',
    type: String,
  })
  @IsDateString()
  active_from: string;

  @ApiProperty({
    description: 'Expire at date',
    example: '2024-06-23T05:46:42.000Z',
    type: String,
  })
  @IsDateString()
  expire_at: string;

  @ApiProperty({ 
    description: 'Target', 
    required: false, 
    default: 0,
    type: Number,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  target?: number = 0;

  @ApiProperty({ 
    description: 'Language code', 
    default: 'en',
    type: String,
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string = 'en';

  @ApiProperty({ 
    description: 'Shop ID', 
    required: false,
    type: Number,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  shop_id?: number;

  @ApiProperty({ 
    description: 'User ID', 
    required: false,
    type: Number,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  user_id?: number;
}