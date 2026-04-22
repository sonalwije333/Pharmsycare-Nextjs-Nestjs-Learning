// dto/get-best-selling-products.dto.ts
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBestSellingProductsDto {
  @IsOptional()
  @IsString()
  type_slug?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  // @IsOptional()
  // @Type(() => Number)
  // shop_id?: number; // Commented for future use
}