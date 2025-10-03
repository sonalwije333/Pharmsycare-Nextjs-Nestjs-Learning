import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Attribute } from '../entities/attribute.entity';
import {QueryAttributesOrderByColumn} from "../../../common/enums/enums";

export class AttributePaginator extends Paginator<Attribute> {}

export class GetAttributeArgs {
  @ApiPropertyOptional({ description: 'Attribute ID' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'Attribute slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Language filter' })
  @IsOptional()
  @IsString()
  language?: string;
}

export class QueryAttributesOrderByOrderByClause {
  @ApiPropertyOptional({ enum: QueryAttributesOrderByColumn })
  @IsEnum(QueryAttributesOrderByColumn)
  column: QueryAttributesOrderByColumn;

  @ApiPropertyOptional({ enum: SortOrder })
  @IsEnum(SortOrder)
  order: SortOrder;
}

export class GetAttributesDto extends PaginationArgs {
  @ApiPropertyOptional({ type: [QueryAttributesOrderByOrderByClause] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryAttributesOrderByOrderByClause)
  orderBy?: QueryAttributesOrderByOrderByClause[];

  @ApiPropertyOptional({ description: 'Shop ID filter' })
  @IsOptional()
  @IsNumber()
  shop_id?: number;

  @ApiPropertyOptional({ description: 'Language filter' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}
