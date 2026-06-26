import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { GrnStatus } from '../entities/goods-received-note.entity';

export class GetGrnsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional({ enum: GrnStatus })
  @IsOptional()
  @IsEnum(GrnStatus)
  status?: GrnStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supplier_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
