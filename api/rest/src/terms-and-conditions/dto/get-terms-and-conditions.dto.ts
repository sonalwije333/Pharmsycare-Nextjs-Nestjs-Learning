// terms-and-conditions/dto/get-terms-and-conditions.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { TermsAndConditions } from '../entities/terms-and-conditions.entity';

export class TermsAndConditionsPaginator extends Paginator<TermsAndConditions> {
  @ApiProperty({ type: [TermsAndConditions] })
  data: TermsAndConditions[];
}

export class GetTermsAndConditionsDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Order by field',
    enum: ['CREATED_AT', 'UPDATED_AT', 'TITLE', 'DESCRIPTION'],
    required: false
  })
  orderBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search text in title or description',
    required: false
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by type',
    example: 'global',
    required: false
  })
  type?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by issued by',
    required: false
  })
  issued_by?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty({
    description: 'Filter by approval status',
    required: false
  })
  is_approved?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by language',
    example: 'en',
    required: false
  })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search join',
    required: false
  })
  searchJoin?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Filter by shop ID',
    required: false
  })
  shop_id?: number;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TITLE = 'TITLE',
  DESCRIPTION = 'DESCRIPTION',
}