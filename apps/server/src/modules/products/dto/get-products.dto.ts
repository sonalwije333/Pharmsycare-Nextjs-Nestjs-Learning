import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Product } from '../entities/product.entity';
import {
  ProductStatus,
  ProductType,
  QueryProductsOrderByColumn,
} from '../../../common/enums/enums';
import { SortOrder } from '../../common/dto/generic-conditions.dto';

export class ProductPaginator extends Paginator<Product> {
}

export class GetProductsDto extends PaginationArgs {
  @ApiPropertyOptional({
    enum: QueryProductsOrderByColumn,
    description: 'Order by column',
    example: QueryProductsOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(QueryProductsOrderByColumn)
  orderBy?: QueryProductsOrderByColumn;

  @ApiPropertyOptional({ description: 'Search query', example: 'baby' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Language', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Shop ID', example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  shop_id?: number;

  @ApiPropertyOptional({ description: 'Type ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  type_id?: string;

  @ApiPropertyOptional({ enum: ProductStatus, description: 'Status filter' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    enum: ProductType,
    description: 'Product type filter',
  })
  @IsOptional()
  @IsEnum(ProductType)
  product_type?: ProductType;
}
