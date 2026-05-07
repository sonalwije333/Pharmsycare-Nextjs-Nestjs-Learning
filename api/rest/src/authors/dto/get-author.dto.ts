import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SortOrder } from 'src/common/enums/enums';
import { Author } from '../entities/author.entity';
import { AuthorOrderByColumn } from 'src/common/enums/author-order-by.enum';

export class AuthorPaginator {
  @ApiProperty({ type: () => [Author], description: 'Array of authors' })
  data: Author[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/authors?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/authors?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/authors?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/authors?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetAuthorDto extends PaginationArgs {
  @ApiProperty({ 
    enum: AuthorOrderByColumn, 
    required: false, 
    default: AuthorOrderByColumn.CREATED_AT,
    description: 'Column to order by',
  })
  @IsOptional()
  @IsEnum(AuthorOrderByColumn)
  orderBy?: AuthorOrderByColumn = AuthorOrderByColumn.CREATED_AT;

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
    example: 'Kaity',
  })
  @IsOptional()
  @IsString()
  search?: string;

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
}