import { SortOrder } from 'src/modules/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/modules/common/dto/pagination-args.dto';
import { Paginator } from 'src/modules/common/dto/paginator.dto';
import { IsOptional, IsString } from 'class-validator';
import { Category } from '../entities/category.entity';

export class CategoriesPaginator extends Paginator<Category> {}

export class GetCategoriesDto extends PaginationArgs {
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

export class QueryCategoriesOrderByOrderByClause {
  column: QueryCategoriesOrderByColumn;
  order: SortOrder;
}

export enum QueryCategoriesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}
