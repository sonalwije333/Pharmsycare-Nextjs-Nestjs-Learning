// dto/get-products.dto.ts
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 30;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['and', 'or', 'AND', 'OR'])
  searchJoin?: string;

  @IsOptional()
  @IsString()
  with?: string;

  @IsOptional()
  @IsString()
  type_slug?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  product_type?: string;

  // @IsOptional()
  // @Type(() => Number)
  // shop_id?: number; // Commented for future use

  @IsOptional()
  @IsString()
  language?: string;
}

export class ProductPaginator {
  data: any[];
  current_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  per_page: number;
  total: number;
}