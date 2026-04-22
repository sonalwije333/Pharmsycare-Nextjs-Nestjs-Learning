// authors/dto/get-author.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Author } from '../entities/author.entity';
import { QueryAuthorsOrderByColumn } from '../../common/enums/enums';

export class AuthorPaginator {
  @ApiProperty({ type: [Author] })
  data: Author[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 30 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/authors?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/authors?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/authors?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/authors?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 30 })
  to: number;
}

export class GetAuthorDto extends PaginationArgs {
  @IsOptional()
  @IsEnum(QueryAuthorsOrderByColumn)
  @ApiProperty({ enum: QueryAuthorsOrderByColumn, required: false })
  orderBy?: QueryAuthorsOrderByColumn;

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
  @ApiProperty({ required: false, default: 'en' })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'and' })
  searchJoin?: string;
}
