import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Category } from '../entities/category.entity';
import { SortOrder } from '../../common/dto/generic-conditions.dto';

export enum QueryCategoriesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
  PRODUCTS_COUNT = 'PRODUCTS_COUNT',
}

export class CategoriesPaginator extends Paginator<Category> {
  @ApiProperty({ type: [Category], description: 'List of categories' })
  declare data: Category[];
}

export class GetCategoriesDto extends PaginationArgs {
  @ApiPropertyOptional({ description: 'Search query', example: 'baby' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsString()
  parent?: string;

  @ApiPropertyOptional({
    description: 'Type ID filter',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Is approved filter', example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_approved?: boolean;

  @ApiPropertyOptional({
    description: 'Order by column',
    enum: QueryCategoriesOrderByColumn,
    example: QueryCategoriesOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
  @IsEnum(QueryCategoriesOrderByColumn)
  orderBy?: QueryCategoriesOrderByColumn;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
