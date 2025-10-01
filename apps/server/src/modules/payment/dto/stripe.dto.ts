import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// Define StripeAddressDto FIRST
export class StripeAddressDto {
  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Address line 1' })
  @IsOptional()
  @IsString()
  line1?: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsOptional()
  @IsString()
  postal_code?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;
}

// Then define StripeCreateCustomerDto that uses it
export class StripeCreateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer address' })
  @IsOptional()
  address?: StripeAddressDto;

  @ApiPropertyOptional({ description: 'Customer description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CardElementDto {
  @ApiProperty({ description: 'Card number' })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({ description: 'Expiration month' })
  @IsNotEmpty()
  @IsNumber()
  exp_month: number;

  @ApiProperty({ description: 'Expiration year' })
  @IsNotEmpty()
  @IsNumber()
  exp_year: number;

  @ApiProperty({ description: 'CVC code' })
  @IsNotEmpty()
  @IsString()
  cvc: string;
}

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount in cents', example: 2000 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency', example: 'usd' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customer?: string;

  @ApiPropertyOptional({ description: 'Payment method types', example: ['card'] })
  @IsOptional()
  payment_method_types?: string[];

  @ApiPropertyOptional({ description: 'Metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}