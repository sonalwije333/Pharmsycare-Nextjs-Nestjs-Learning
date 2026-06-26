import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProcurementStatus } from '../entities/procurement-record.entity';

export class CreateProcurementRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  reorder_request_id?: number;

  @ApiProperty()
  @IsInt()
  supplier_id: number;

  @ApiProperty()
  @IsInt()
  product_id: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  unit_cost?: number;

  @ApiPropertyOptional({ enum: ProcurementStatus })
  @IsOptional()
  @IsEnum(ProcurementStatus)
  status?: ProcurementStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
