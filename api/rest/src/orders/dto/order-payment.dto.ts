// orders/dto/order-payment.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class OrderPaymentDto {
  @ApiProperty({
    description: 'Tracking number',
    example: 20240207303639,
    required: true
  })
  @IsNumber()
  tracking_number: number;
}