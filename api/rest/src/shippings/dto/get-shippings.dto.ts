// shipping/dto/get-shippings.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Shipping } from '../entities/shipping.entity';

export class ShippingPaginator extends Paginator<Shipping> {
  @ApiProperty({ type: [Shipping] })
  data: Shipping[];
}

export class GetShippingsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'name', 'amount', 'is_global', 'type'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'name', 'amount', 'is_global', 'type'])
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc', 'ASC', 'DESC'],
    required: false,
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text in name',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by global status',
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_global?: boolean;

  @ApiProperty({
    description: 'Filter by shipping type',
    enum: ['fixed', 'percentage', 'free'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['fixed', 'percentage', 'free'])
  type?: string;

  @ApiProperty({
    description: 'Filter by shop ID',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shop_id?: number;

  @ApiProperty({
    description: 'Search join operator',
    enum: ['and', 'or', 'AND', 'OR'],
    required: false,
    default: 'and'
  })
  @IsOptional()
  @IsString()
  @IsIn(['and', 'or', 'AND', 'OR'])
  searchJoin?: string;
}

export enum QueryShippingClassesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
  AMOUNT = 'AMOUNT',
  IS_GLOBAL = 'IS_GLOBAL',
  TYPE = 'TYPE',
}