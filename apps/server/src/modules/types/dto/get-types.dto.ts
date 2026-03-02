import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { QueryTypesOrderByColumn } from '../../../common/enums/enums';
import { Type as TypeEntity } from '../entities/type.entity';

class QueryTypesOrderByOrderByClause {
  @ApiPropertyOptional({
    enum: QueryTypesOrderByColumn,
    description: 'Column to sort by',
    example: QueryTypesOrderByColumn.CREATED_AT,
  })
  @IsEnum(QueryTypesOrderByColumn)
  column: QueryTypesOrderByColumn;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Sort direction',
    example: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  order: SortOrder;
}

export class TypesPaginator extends Paginator<TypeEntity> {
  @ApiProperty({ type: [TypeEntity], description: 'List of types' })
  declare data: TypeEntity[];
}

@ApiExtraModels(QueryTypesOrderByOrderByClause)
export class GetTypesDto extends PaginationArgs {
  @ApiPropertyOptional({
    type: [QueryTypesOrderByOrderByClause],
    description: 'Sorting rules (must be JSON string in query)',
    example: [
      { column: QueryTypesOrderByColumn.CREATED_AT, order: SortOrder.DESC },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QueryTypesOrderByOrderByClause)
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    let parsedValue = value;

    if (typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value);
      } catch {
        return undefined;
      }
    }

    if (Array.isArray(parsedValue)) {
      return parsedValue;
    }

    if (typeof parsedValue === 'object') {
      return Object.keys(parsedValue).length === 0 ? [] : [parsedValue];
    }

    return undefined;
  })
  orderBy?: QueryTypesOrderByOrderByClause[];

  @ApiPropertyOptional({
    description: 'Search text filter',
    example: 'medicine',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Language code',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'General search keyword',
    example: 'paracetamol',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
