import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class AssignProductDto {
  @ApiProperty({ description: 'Catalogue product id to place on the shelf' })
  @IsInt()
  product_id: number;

  @ApiPropertyOptional({ example: 'Bin 3' })
  @IsOptional()
  @IsString()
  bin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
