// attributes/dto/get-attributes.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { QueryAttributesOrderByColumn } from '../../common/enums/enums';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAttributesOrderByOrderByClause {
  @ApiProperty({
    enum: QueryAttributesOrderByColumn,
    example: QueryAttributesOrderByColumn.NAME,
  })
  column: QueryAttributesOrderByColumn;

  @ApiProperty({
    enum: SortOrder,
    example: SortOrder.ASC,
  })
  order: SortOrder;
}

export class GetAttributesArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Order by clauses',
  })
  orderBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort direction',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  sortedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search join operator',
    required: false,
    enum: ['and', 'or'],
    default: 'and',
  })
  searchJoin?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Filter by shop ID',
    example: 1,
    required: false,
  })
  shop_id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false,
    default: 'en',
  })
  language?: string;
}
