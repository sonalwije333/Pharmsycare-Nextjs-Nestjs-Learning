import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { GrnStatus } from '../entities/goods-received-note.entity';

export class CreateGrnItemDto {
  @ApiProperty()
  @IsInt()
  product_id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  ordered_quantity?: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  received_quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  unit_cost?: number;
}

export class CreateGrnDto {
  @ApiProperty()
  @IsInt()
  supplier_id: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  reorder_request_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiPropertyOptional({ enum: GrnStatus })
  @IsOptional()
  @IsEnum(GrnStatus)
  status?: GrnStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateGrnItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGrnItemDto)
  items: CreateGrnItemDto[];
}
