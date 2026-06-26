import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class AssignProductSupplierDto {
  @ApiProperty()
  @IsNumber()
  product_id: number;

  @ApiPropertyOptional({ default: 50 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  reorder_quantity?: number;
}
