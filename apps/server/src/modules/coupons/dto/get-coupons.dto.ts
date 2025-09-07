// src/modules/coupons/dto/get-coupons.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Coupon } from '../entities/coupon.entity';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import {QueryCouponsOrderByColumn} from "../../../common/enums/enums";

export class CouponPaginator extends Paginator<Coupon> {}

export class GetCouponsDto extends PaginationArgs {
    @ApiPropertyOptional({ description: 'Order by column', enum: QueryCouponsOrderByColumn })
    @IsOptional()
    @IsEnum(QueryCouponsOrderByColumn)
    orderBy?: QueryCouponsOrderByColumn;

    @ApiPropertyOptional({ description: 'Search query', example: 'discount' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Shop ID filter', example: 1 })
    @IsOptional()
    @IsNumber()
    shop_id?: number;

    @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Is approved filter', example: true })
    @IsOptional()
    @IsString()
    is_approve?: string;
}

