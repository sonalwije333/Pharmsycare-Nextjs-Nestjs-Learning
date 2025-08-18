import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationArgs {
  // FIX ME
  @IsOptional()
  @IsNumber()
  first?: number = 15;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 15;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsString()
  searchJoin?: string;

  @IsOptional()
  @IsString()
  sortedBy?: string;

  @IsOptional()
  @IsString()
  with?: string;
}
