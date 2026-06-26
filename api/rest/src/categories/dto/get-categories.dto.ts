// categories/dto/get-categories.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Category } from '../entities/category.entity';
import { QueryCategoriesOrderByColumn } from '../../common/enums/enums';

export class CategoryPaginator {
  @ApiProperty({ type: [Category] })
  data: Category[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 30 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/categories?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/categories?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/categories?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/categories?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 30 })
  to: number;
}

export class GetCategoriesDto extends PaginationArgs {
  @IsOptional()
  @IsEnum(QueryCategoriesOrderByColumn)
  @ApiProperty({ enum: QueryCategoriesOrderByColumn, required: false })
  orderBy?: QueryCategoriesOrderByColumn;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  sortedBy?: SortOrder;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: 'null' })
  parent?: number | string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: 'en' })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'and' })
  searchJoin?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ required: false, example: 213 })
  self?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'medicine' })
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({ required: false })
  type_id?: number;
}
