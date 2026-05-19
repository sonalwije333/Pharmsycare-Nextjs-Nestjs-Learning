import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { PaymentMethodType } from 'src/common/enums/payment-method.enum';


export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Payment method key', example: 'pm_123456789', type: String })
  @IsString()
  method_key: string;

  @ApiProperty({ description: 'Set as default card', example: false, required: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  default_card?: boolean;

  @ApiProperty({ description: 'Payment gateway ID', required: false, type: Number })
  @IsOptional()
  @IsNumber()
  payment_gateway_id?: number;

  @ApiProperty({ description: 'Card fingerprint', required: false, type: String })
  @IsOptional()
  @IsString()
  fingerprint?: string;

  @ApiProperty({ description: 'Card owner name', required: false, type: String })
  @IsOptional()
  @IsString()
  owner_name?: string;

  @ApiProperty({ description: 'Card network', example: 'visa', required: false, type: String })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiProperty({ description: 'Card type', enum: PaymentMethodType, required: false })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;

  @ApiProperty({ description: 'Last 4 digits', example: '4242', required: false, type: String })
  @IsOptional()
  @IsString()
  last4?: string;

  @ApiProperty({ description: 'Expiry date', example: '12/2025', required: false, type: String })
  @IsOptional()
  @IsString()
  expires?: string;

  @ApiProperty({ description: 'Card origin country', example: 'US', required: false, type: String })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiProperty({ description: 'Verification check', required: false, type: String })
  @IsOptional()
  @IsString()
  verification_check?: string;

  @ApiProperty({ description: 'User ID', type: Number })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'Gateway name', example: 'STRIPE', type: String })
  @IsString()
  gateway_name: string;
}