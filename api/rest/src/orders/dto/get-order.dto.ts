import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetOrderArgs {
  @ApiProperty({ description: 'Order ID', example: 48, required: false, type: Number })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Order tracking number', example: '20240207303639', required: false, type: String })
  @IsOptional()
  @IsString()
  tracking_number?: string;
}