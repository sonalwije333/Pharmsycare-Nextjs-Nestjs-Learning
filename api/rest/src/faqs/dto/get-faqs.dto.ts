import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { Faq } from '../entities/faq.entity';
import { FaqOrderByColumn, FaqType } from 'src/common/enums/faq-type.enum';

export class FaqPaginator {
  @ApiProperty({ type: () => [Faq] })
  data: Faq[];

  @ApiProperty({ example: 1, type: Number })
  current_page: number;

  @ApiProperty({ example: 30, type: Number })
  per_page: number;

  @ApiProperty({ example: 100, type: Number })
  total: number;

  @ApiProperty({ example: 10, type: Number })
  last_page: number;

  @ApiProperty({ example: '/faqs?page=1', type: String })
  first_page_url: string;

  @ApiProperty({ example: '/faqs?page=10', type: String })
  last_page_url: string;

  @ApiProperty({ example: '/faqs?page=2', nullable: true, type: String })
  next_page_url: string | null;

  @ApiProperty({ example: '/faqs?page=1', nullable: true, type: String })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number })
  from: number;

  @ApiProperty({ example: 30, type: Number })
  to: number;
}

export class GetFaqsDto extends PaginationArgs {
  @ApiProperty({ 
    enum: FaqOrderByColumn, 
    required: false, 
    default: FaqOrderByColumn.CREATED_AT,
    description: 'Column to order by',
  })
  @IsOptional()
  @IsEnum(FaqOrderByColumn)
  orderBy?: FaqOrderByColumn = FaqOrderByColumn.CREATED_AT;

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
    example: 'return policy',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    required: false, 
    enum: FaqType,
    description: 'Filter by FAQ type',
    example: FaqType.GLOBAL,
  })
  @IsOptional()
  @IsEnum(FaqType)
  faq_type?: FaqType;

  @ApiProperty({ 
    required: false, 
    type: Number,
    description: 'Filter by shop ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shop_id?: number;

  @ApiProperty({ 
    required: false, 
    type: String,
    description: 'Filter by issuer',
    example: 'Super Admin',
  })
  @IsOptional()
  @IsString()
  issued_by?: string;

  @ApiProperty({ 
    required: false, 
    default: 'en',
    type: String,
    description: 'Filter by language',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string = 'en';
}

