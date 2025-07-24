import { SortOrder } from "src/modules/common/dto/generic-conditions.dto";
import { PaginationArgs } from "src/modules/common/dto/pagination-args.dto";
import { Paginator } from "src/modules/common/dto/paginator.dto";
import { Type } from "../entities/type.entity";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type as TransformType } from 'class-transformer';

export class TypesPaginator extends Paginator<Type> {
}

export class GetTypesDto extends PaginationArgs {
  @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @TransformType(() => QueryTypesOrderByOrderByClause)
  orderBy?: string[];

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

export class QueryTypesOrderByOrderByClause {
  column: QueryTypesOrderByColumn;
  order: SortOrder;
}

export enum QueryTypesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}
