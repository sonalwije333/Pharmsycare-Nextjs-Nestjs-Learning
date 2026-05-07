import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { AttributeOrderByColumn } from 'src/common/enums/attribute-order-by.enum';


export class QueryAttributesOrderByOrderByClause {
  @ApiProperty({ enum: AttributeOrderByColumn, example: AttributeOrderByColumn.NAME })
  @IsEnum(AttributeOrderByColumn)
  column: AttributeOrderByColumn;

  @ApiProperty({ enum: SortOrder, example: SortOrder.ASC })
  @IsEnum(SortOrder)
  order: SortOrder;
}

export class GetAttributesArgs {
  @ApiProperty({ type: [QueryAttributesOrderByOrderByClause], required: false, description: 'Order by clauses' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryAttributesOrderByOrderByClause)
  orderBy?: QueryAttributesOrderByOrderByClause[];

  @ApiProperty({ description: 'Filter by shop ID', example: 1, required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shop_id?: number;

  @ApiProperty({ description: 'Language code', example: 'en', required: false, default: 'en', type: String })
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @ApiProperty({
    enum: AttributeOrderByColumn,
    required: false,
    description: 'Flat sort column (Swagger compatibility)',
    example: AttributeOrderByColumn.NAME,
  })
  @IsOptional()
  @IsEnum(AttributeOrderByColumn)
  column?: AttributeOrderByColumn;

  @ApiProperty({
    enum: SortOrder,
    required: false,
    description: 'Flat sort order (Swagger compatibility)',
    example: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;
}