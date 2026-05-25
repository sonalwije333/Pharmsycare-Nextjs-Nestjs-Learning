// shops/dto/get-shops.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Shop } from '../entities/shop.entity';

export class ShopPaginator extends Paginator<Shop> {
  @ApiProperty({ type: [Shop] })
  data: Shop[];
}

export class GetShopsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['name', 'created_at', 'updated_at', 'orders_count', 'products_count'],
    required: false
  })
  @IsOptional()
  @IsIn(['name', 'created_at', 'updated_at', 'orders_count', 'products_count'])
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text in name or description',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Name search alias',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Language code',
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'How to join search conditions',
    enum: ['and', 'or'],
    required: false,
  })
  @IsOptional()
  @IsIn(['and', 'or', 'AND', 'OR'])
  searchJoin?: string;

  @ApiProperty({
    description: 'Filter by active status',
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'Filter by owner ID',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  owner_id?: number;

  @ApiProperty({
    description: 'Relations to include (comma-separated)',
    required: false
  })
  @IsOptional()
  @IsString()
  with?: string;
}