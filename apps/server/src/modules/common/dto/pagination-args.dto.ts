import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationArgs {
  // FIX ME
  @IsOptional()
  @IsNumber()
  first?: number = 15;

  @IsOptional()
  @IsNumber()
  limit?: number = 15;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsString()
  searchJoin?: string;

  @IsOptional()
  @IsString()
  sortedBy?: string;
}
