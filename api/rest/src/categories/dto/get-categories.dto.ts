// categories/dto/get-categories.dto.ts
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ enum: QueryCategoriesOrderByColumn, required: false })
  orderBy?: QueryCategoriesOrderByColumn;

  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  sortedBy?: SortOrder;

  @ApiProperty({ required: false })
  search?: string;

  @ApiProperty({ required: false, default: 'null' })
  parent?: number | string;

  @ApiProperty({ required: false, default: 'en' })
  language?: string;

  @ApiProperty({ required: false })
  type_id?: number;
}
