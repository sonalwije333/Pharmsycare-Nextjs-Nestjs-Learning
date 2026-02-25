import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Attribute } from '../entities/attribute.entity';
import { QueryAttributesOrderByColumn } from '../../../common/enums/enums';

export class AttributePaginator extends Paginator<Attribute> {}

export class GetAttributesDto extends PaginationArgs {
  @ApiPropertyOptional({
    description: 'Order by column',
    enum: QueryAttributesOrderByColumn,
    example: QueryAttributesOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(QueryAttributesOrderByColumn)
  orderBy?: QueryAttributesOrderByColumn;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  declare sortedBy?: SortOrder;

  @ApiPropertyOptional({ description: 'Search query', example: 'size' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Shop ID filter', example: 1 })
  @IsOptional()
  @IsNumber()
  shop_id?: number;

  @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;
}
