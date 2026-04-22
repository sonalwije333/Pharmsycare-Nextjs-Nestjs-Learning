// payment-method/dto/create-payment-method.dto.ts
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';
import { PaymentMethod } from '../entities/payment-method.entity';

export class CreatePaymentMethodDto extends OmitType(PaymentMethod, [
  'id',
  'created_at',
  'updated_at',
  'default_card',
] as const) {
  @ApiProperty({ description: 'Payment method key', example: 'pm_123456789' })
  @IsString()
  method_key: string;

  @ApiProperty({ description: 'Set as default card', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  default_card?: boolean;

  @ApiProperty({ description: 'Payment gateway ID', required: false })
  @IsOptional()
  @IsNumber()
  payment_gateway_id?: number;

  @ApiProperty({ description: 'Card fingerprint', required: false })
  @IsOptional()
  @IsString()
  fingerprint?: string;

  @ApiProperty({ description: 'Card owner name', required: false })
  @IsOptional()
  @IsString()
  owner_name?: string;

  @ApiProperty({ description: 'Card network', example: 'visa', required: false })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiProperty({ description: 'Card type', example: 'credit', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Last 4 digits', example: '4242', required: false })
  @IsOptional()
  @IsString()
  last4?: string;

  @ApiProperty({ description: 'Expiry date', example: '12/2025', required: false })
  @IsOptional()
  @IsString()
  expires?: string;
}