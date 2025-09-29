import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConnectProductOrderPivot, UserAddressInput } from './create-order.dto';

export class CheckoutVerificationDto {
  @ApiProperty({ description: 'Order amount', example: 99.99 })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Products to verify',
    type: [ConnectProductOrderPivot]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectProductOrderPivot)
  products: ConnectProductOrderPivot[];

  @ApiPropertyOptional({
    description: 'Billing address',
    type: UserAddressInput
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  billing_address?: UserAddressInput;

  @ApiPropertyOptional({
    description: 'Shipping address',
    type: UserAddressInput
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  shipping_address?: UserAddressInput;

  @ApiPropertyOptional({ description: 'Customer ID', example: 'cust_123' })
  @IsOptional()
  @IsString()
  customer_id?: string;
}

export class VerifiedCheckoutData {
  @ApiProperty({ description: 'Total tax', example: 8.99 })
  total_tax: number;

  @ApiProperty({ description: 'Shipping charge', example: 5.99 })
  shipping_charge: number;

  @ApiProperty({ description: 'Unavailable product IDs', example: [5, 8] })
  unavailable_products: number[];

  @ApiProperty({ description: 'Wallet currency', example: 'USD' })
  wallet_currency: string;

  @ApiProperty({ description: 'Wallet amount', example: 25.00 })
  wallet_amount: number;
}