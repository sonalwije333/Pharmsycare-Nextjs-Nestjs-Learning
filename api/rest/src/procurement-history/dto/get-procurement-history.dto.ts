import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProcurementStatus } from '../entities/procurement-record.entity';

export class GetProcurementHistoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  supplier_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  product_id?: number;

  @ApiPropertyOptional({ enum: ProcurementStatus })
  @IsOptional()
  @IsEnum(ProcurementStatus)
  status?: ProcurementStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
