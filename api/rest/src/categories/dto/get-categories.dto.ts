import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsNumber, IsEnum, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { Category } from '../entities/category.entity';
import { CategoryOrderByColumn } from 'src/common/enums/category-type.enum';

export class CategoryPaginator {
  @ApiProperty({ type: () => [Category] })
  data: Category[];

  @ApiProperty({ example: 1, type: Number })
  current_page: number;

  @ApiProperty({ example: 30, type: Number })
  per_page: number;

  @ApiProperty({ example: 100, type: Number })
  total: number;

  @ApiProperty({ example: 10, type: Number })
  last_page: number;

  @ApiProperty({ example: '/categories?page=1', type: String })
  first_page_url: string;

  @ApiProperty({ example: '/categories?page=10', type: String })
  last_page_url: string;

  @ApiProperty({ example: '/categories?page=2', nullable: true, type: String })
  next_page_url: string | null;

  @ApiProperty({ example: '/categories?page=1', nullable: true, type: String })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number })
  from: number;

  @ApiProperty({ example: 30, type: Number })
  to: number;
}

export class GetCategoriesDto extends PaginationArgs {
  @ApiProperty({ 
    enum: CategoryOrderByColumn, 
    required: false, 
    default: CategoryOrderByColumn.CREATED_AT,
    description: 'Column to order by',
  })
  @IsOptional()
  @IsEnum(CategoryOrderByColumn)
  orderBy?: CategoryOrderByColumn = CategoryOrderByColumn.CREATED_AT;

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
    example: 'Fruits',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'How to join search conditions',
    enum: ['and', 'or'],
    required: false,
  })
  @IsOptional()
  @IsIn(['and', 'or', 'AND', 'OR'])
  searchJoin?: string;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Parent category ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parent?: number;

  @ApiProperty({ 
    required: false, 
    default: 'en',
    type: String,
    description: 'Language code',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Type ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  type_id?: number;
}