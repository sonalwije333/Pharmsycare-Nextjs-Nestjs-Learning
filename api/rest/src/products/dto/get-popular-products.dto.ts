// dto/get-popular-products.dto.ts
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPopularProductsDto {
  @IsOptional()
  @IsString()
  type_slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  with?: string;

  @IsOptional()
  @IsString()
  @IsIn(['and', 'or'])
  searchJoin?: string;

  @IsOptional()
  @IsString()
  language?: string;

  // @IsOptional()
  // @Type(() => Number)
  // shop_id?: number; // Commented for future use
}