import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetOrderArgs {
  @ApiPropertyOptional({ description: 'Order ID', example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'Tracking number', example: 'TRK-123456' })
  @IsOptional()
  @IsString()
  tracking_number?: string;
}