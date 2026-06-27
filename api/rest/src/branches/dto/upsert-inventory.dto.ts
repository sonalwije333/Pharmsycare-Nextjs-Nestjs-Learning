import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpsertInventoryDto {
  @ApiProperty()
  @IsInt()
  product_id: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorder_level?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;
}
