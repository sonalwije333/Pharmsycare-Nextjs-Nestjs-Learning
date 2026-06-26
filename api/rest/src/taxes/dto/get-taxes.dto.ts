// taxes/dto/get-taxes.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Tax } from '../entities/tax.entity';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class TaxPaginator extends Paginator<Tax> {
  @ApiProperty({ type: [Tax] })
  data: Tax[];
}

export class GetTaxesDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'name', 'rate', 'country', 'state'],
    required: false
  })
  orderBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc'
  })
  sortedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search text in name',
    required: false
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search join operator',
    enum: ['and', 'or'],
    required: false,
    default: 'and'
  })
  searchJoin?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by country',
    required: false
  })
  country?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by state',
    required: false
  })
  state?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Filter by global status',
    required: false
  })
  is_global?: boolean;
}

export enum QueryTaxClassesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
  RATE = 'RATE',
  COUNTRY = 'COUNTRY',
  STATE = 'STATE',
}