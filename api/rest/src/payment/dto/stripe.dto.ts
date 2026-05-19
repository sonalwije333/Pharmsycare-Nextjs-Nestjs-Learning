import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Address {
  @ApiProperty({ example: 'Zurich', required: false, type: String })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Switzerland', required: false, type: String })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '123 Main St', required: false, type: String })
  @IsOptional()
  @IsString()
  line1?: string;

  @ApiProperty({ example: 'Apt 4B', required: false, type: String })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: '8001', required: false, type: String })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ example: 'Zurich', required: false, type: String })
  @IsOptional()
  @IsString()
  state?: string;
}

export class StripeCreateCustomerDto {
  @ApiProperty({ description: 'Customer address', required: false, type: () => Address })
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  address?: Address;

  @ApiProperty({ description: 'Customer description', required: false, type: String })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Customer name', example: 'John Doe', required: false, type: String })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Customer email', example: 'customer@example.com', required: false, type: String })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CardElementDto {
  @ApiProperty({ description: 'Card number', example: '4242424242424242', type: String })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Expiry month', example: 12, type: Number })
  @IsNumber()
  exp_month: number;

  @ApiProperty({ description: 'Expiry year', example: 2025, type: Number })
  @IsNumber()
  exp_year: number;

  @ApiProperty({ description: 'CVC code', example: '123', type: String })
  @IsString()
  cvc: string;
}

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Payment amount', example: 1000, type: Number })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency', example: 'usd', default: 'usd', type: String })
  @IsOptional()
  @IsString()
  currency?: string = 'usd';
}