// coupons/dto/get-coupons.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Coupon } from '../entities/coupon.entity';
import { QueryCouponsOrderByColumn } from '../../common/enums/enums';

export class CouponPaginator {
  @ApiProperty({ type: [Coupon] })
  data: Coupon[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 30 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/coupons?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/coupons?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/coupons?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/coupons?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 30 })
  to: number;
}

export class GetCouponsDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({ enum: QueryCouponsOrderByColumn, required: false })
  orderBy?: QueryCouponsOrderByColumn;

  @IsOptional()
  @IsString()
  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  sortedBy?: SortOrder;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ required: false })
  shop_id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: 'en' })
  language?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchJoin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  with?: string;
}
