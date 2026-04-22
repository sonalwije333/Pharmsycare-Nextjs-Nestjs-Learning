// types/dto/get-types.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Type } from '../entities/type.entity';

export class TypePaginator extends Paginator<Type> {
  @ApiProperty({ type: [Type] })
  data: Type[];
}

export class GetTypesDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Order by field',
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT'],
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
    description: 'Search text in name',
    required: false
  })
  text?: string;

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
    description: 'Search with field:value pairs separated by semicolon',
    required: false
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Join condition for search terms',
    required: false,
    example: 'and'
  })
  searchJoin?: string;
}

export enum QueryTypesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}

export class QueryTypesOrderByOrderByClause {
  column: QueryTypesOrderByColumn;
  order: 'ASC' | 'DESC';
}