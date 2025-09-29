import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class OrderPaymentDto {
  @ApiProperty({ description: 'Tracking number', example: 123456 })
  @IsNumber()
  tracking_number: number;
}