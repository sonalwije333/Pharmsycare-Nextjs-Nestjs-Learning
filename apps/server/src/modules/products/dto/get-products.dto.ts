import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
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
  declare data: Product[];
}

export class GetProductsDto extends PaginationArgs {
  @ApiPropertyOptional({
    enum: QueryProductsOrderByColumn,
    description: 'Order by column',
    example: QueryProductsOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(QueryProductsOrderByColumn)
  orderBy?: QueryProductsOrderByColumn;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Sort order',
    example: SortOrder.DESC,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsEnum(SortOrder)
  sortedBy: SortOrder = SortOrder.DESC;

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

  @ApiPropertyOptional({
    description: 'Type ID',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  type_id?: number;

  @ApiPropertyOptional({ enum: ProductStatus, description: 'Status filter' })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    enum: ProductType,
    description: 'Product type filter',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(ProductType)
  product_type?: ProductType;
}
