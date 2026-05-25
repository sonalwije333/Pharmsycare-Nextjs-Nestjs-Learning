// payment/dto/stripe.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Address {
  @ApiProperty({ example: 'Zurich', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Switzerland', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  line1?: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: '8001', required: false })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiProperty({ example: 'Zurich', required: false })
  @IsOptional()
  @IsString()
  state?: string;
}

export class StripeCreateCustomerDto {
  @ApiProperty({ description: 'Customer address', required: false })
  @IsOptional()
  @IsObject()
  address?: Address;

  @ApiProperty({ description: 'Customer description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Customer name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Customer email', example: 'customer@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CardElementDto {
  @ApiProperty({ description: 'Card number', example: '4242424242424242' })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Expiry month', example: 12 })
  @IsNumber()
  exp_month: number;

  @ApiProperty({ description: 'Expiry year', example: 2025 })
  @IsNumber()
  exp_year: number;

  @ApiProperty({ description: 'CVC code', example: '123' })
  @IsString()
  cvc: string;
}

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Payment amount', example: 1000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency', example: 'usd', default: 'usd' })
  @IsOptional()
  @IsString()
  currency?: string;
}