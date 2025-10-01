import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class GetPaymentIntentDto {
  @ApiProperty({ description: 'Order tracking number', example: 334983046149 })
  @IsNumber()
  tracking_number: number;

  @ApiProperty({ description: 'Payment gateway', example: 'stripe' })
  @IsString()
  payment_gateway: string;

  @ApiProperty({ description: 'Recall gateway', example: false })
  @IsBoolean()
  recall_gateway: boolean;
}