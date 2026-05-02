// orders/dto/verify-checkout.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConnectProductOrderPivot, UserAddressInput } from './create-order.dto';

export class CheckoutVerificationDto {
  @ApiProperty({ description: 'Amount', example: 14.5 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Products', type: [ConnectProductOrderPivot] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectProductOrderPivot)
  products: ConnectProductOrderPivot[];

  @ApiProperty({ description: 'Billing address', type: UserAddressInput, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  billing_address?: UserAddressInput;

  @ApiProperty({ description: 'Shipping address', type: UserAddressInput, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  shipping_address?: UserAddressInput;

  @ApiProperty({ description: 'Customer ID', example: '2', required: false })
  @IsOptional()
  @IsString()
  customer_id?: string;
}

export class VerifiedCheckoutData {
  total_tax: number;
  shipping_charge: number;
  unavailable_products: number[];
  wallet_currency: number;
  wallet_amount: number;
}