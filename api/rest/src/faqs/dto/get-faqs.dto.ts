// faqs/dto/get-faqs.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Faq } from '../entities/faq.entity';
import { QueryFaqsOrderByColumn } from '../../common/enums/enums';

export class FaqPaginator {
  @ApiProperty({ type: [Faq] })
  data: Faq[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 30 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/faqs?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/faqs?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/faqs?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/faqs?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 30 })
  to: number;
}

export class GetFaqsDto extends PaginationArgs {
  @IsOptional()
  @IsEnum(QueryFaqsOrderByColumn)
  @ApiProperty({ enum: QueryFaqsOrderByColumn, required: false })
  orderBy?: QueryFaqsOrderByColumn;

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
  @ApiProperty({ required: false })
  faq_type?: string;

  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false })
  shop_id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  issued_by?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, default: 'en' })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, enum: ['and', 'or'], default: 'and' })
  searchJoin?: string;
}
