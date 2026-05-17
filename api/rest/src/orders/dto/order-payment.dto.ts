import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class OrderPaymentDto {
  @ApiProperty({ description: 'Tracking number', example: 20240207303639, required: true, type: Number })
  @IsNumber()
  tracking_number: number;
}