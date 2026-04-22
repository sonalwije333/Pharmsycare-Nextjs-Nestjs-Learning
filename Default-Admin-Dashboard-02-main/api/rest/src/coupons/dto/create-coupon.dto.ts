// coupons/dto/create-coupon.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Attachment } from '../../common/entities/attachment.entity';
import { CouponType } from '../../common/enums/enums';

export class CreateCouponDto {
  @ApiProperty({ description: 'Coupon code', example: '5OFF' })
  @IsString()
  code: string;

  @ApiProperty({
    enum: CouponType,
    description: 'Coupon type',
    example: CouponType.FIXED,
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ description: 'Coupon description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Discount amount', example: 5 })
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Minimum cart amount', example: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minimum_cart_amount?: number;

  @ApiProperty({
    type: Attachment,
    description: 'Coupon image',
    required: false,
  })
  @ValidateNested()
  @Type(() => Attachment)
  @IsOptional()
  image?: Attachment;

  @ApiProperty({
    description: 'Active from date',
    example: '2021-03-28T05:46:42.000Z',
  })
  @IsDateString()
  active_from: string;

  @ApiProperty({
    description: 'Expire at date',
    example: '2024-06-23T05:46:42.000Z',
  })
  @IsDateString()
  expire_at: string;

  @ApiProperty({ description: 'Target', required: false, default: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  target?: number;

  @ApiProperty({ description: 'Language code', default: 'en' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ description: 'Shop ID', required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  shop_id?: number;
}
