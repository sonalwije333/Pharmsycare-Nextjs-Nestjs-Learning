import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { Coupon } from '../entities/coupon.entity';
import { CouponOrderByColumn } from 'src/common/enums/coupon-type.enum';

export class CouponPaginator {
  @ApiProperty({ type: () => [Coupon] })
  data: Coupon[];

  @ApiProperty({ example: 1, type: Number })
  current_page: number;

  @ApiProperty({ example: 30, type: Number })
  per_page: number;

  @ApiProperty({ example: 100, type: Number })
  total: number;

  @ApiProperty({ example: 10, type: Number })
  last_page: number;

  @ApiProperty({ example: '/coupons?page=1', type: String })
  first_page_url: string;

  @ApiProperty({ example: '/coupons?page=10', type: String })
  last_page_url: string;

  @ApiProperty({ example: '/coupons?page=2', nullable: true, type: String })
  next_page_url: string | null;

  @ApiProperty({ example: '/coupons?page=1', nullable: true, type: String })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number })
  from: number;

  @ApiProperty({ example: 30, type: Number })
  to: number;
}

export class GetCouponsDto extends PaginationArgs {
  @ApiProperty({ 
    enum: CouponOrderByColumn, 
    required: false, 
    default: CouponOrderByColumn.CREATED_AT,
    description: 'Column to order by',
  })
  @IsOptional()
  @IsEnum(CouponOrderByColumn)
  orderBy?: CouponOrderByColumn = CouponOrderByColumn.CREATED_AT;

  @ApiProperty({ 
    enum: SortOrder, 
    required: false, 
    default: SortOrder.DESC,
    description: 'Sort direction',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;

  @ApiProperty({ 
    required: false, 
    type: String,
    description: 'Search term',
    example: '5OFF',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Filter by shop ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shop_id?: number;

  @ApiProperty({ 
    required: false, 
    type: String,
    description: 'Filter by language',
    default: 'en',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @ApiProperty({ 
    required: false, 
    type: Boolean,
    description: 'Filter by approval status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  is_approve?: boolean;
}
