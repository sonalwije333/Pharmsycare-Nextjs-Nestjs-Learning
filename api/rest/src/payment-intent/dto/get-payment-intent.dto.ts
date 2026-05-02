// payment-intent/dto/get-payment-intent.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

export class GetPaymentIntentDto {
  @ApiProperty({ description: 'Order tracking number', example: 20240207303639 })
  @IsNumber()
  tracking_number: number;

  @ApiProperty({ description: 'Payment gateway', example: 'STRIPE' })
  @IsString()
  payment_gateway: string;

  @ApiProperty({ description: 'Recall gateway', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  recall_gateway?: boolean;
}