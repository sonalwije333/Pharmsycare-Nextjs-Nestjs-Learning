import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentGatewayType } from '../../../common/enums/enums';

export class UserAddressInput {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsString()
  street_address: string;

  @ApiProperty({ description: 'Country', example: 'United States' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State', example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'ZIP code', example: '10001' })
  @IsString()
  zip: string;
}

export class ConnectProductOrderPivot {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsNumber()
  product_id: number;

  @ApiPropertyOptional({ description: 'Variation option ID', example: 1 })
  @IsOptional()
  @IsNumber()
  variation_option_id?: number;

  @ApiProperty({ description: 'Order quantity', example: 2 })
  @IsNumber()
  order_quantity: number;

  @ApiProperty({ description: 'Unit price', example: 29.99 })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ description: 'Subtotal', example: 59.98 })
  @IsNumber()
  subtotal: number;
}

export class CardInput {
  @ApiProperty({ description: 'Card number', example: '4242424242424242' })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Expiry month', example: '12' })
  @IsString()
  expiryMonth: string;

  @ApiProperty({ description: 'Expiry year', example: '2025' })
  @IsString()
  expiryYear: string;

  @ApiProperty({ description: 'CVV', example: '123' })
  @IsString()
  cvv: string;

  @ApiPropertyOptional({ description: 'Email', example: 'customer@example.com' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ description: 'Shop ID', example: 1 })
  @IsOptional()
  @IsNumber()
  shop_id?: number;

  @ApiPropertyOptional({ description: 'Coupon ID', example: 1 })
  @IsOptional()
  @IsNumber()
  coupon_id?: number;

  @ApiProperty({ description: 'Order status', example: 'pending' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Customer contact', example: '+1234567890' })
  @IsString()
  customer_contact: string;

  @ApiProperty({
    description: 'Products in order',
    type: [ConnectProductOrderPivot]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectProductOrderPivot)
  products: ConnectProductOrderPivot[];

  @ApiProperty({ description: 'Order amount', example: 99.99 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Sales tax', example: 8.99 })
  @IsNumber()
  sales_tax: number;

  @ApiPropertyOptional({ description: 'Total amount', example: 108.98 })
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiPropertyOptional({ description: 'Paid total', example: 108.98 })
  @IsOptional()
  @IsNumber()
  paid_total?: number;

  @ApiPropertyOptional({ description: 'Payment ID', example: 'pay_123456' })
  @IsOptional()
  @IsString()
  payment_id?: string;

  @ApiPropertyOptional({
    description: 'Payment gateway',
    enum: PaymentGatewayType,
    example: PaymentGatewayType.STRIPE
  })
  @IsOptional()
  @IsEnum(PaymentGatewayType)
  payment_gateway?: PaymentGatewayType;

  @ApiPropertyOptional({ description: 'Discount amount', example: 10.00 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ description: 'Delivery fee', example: 5.99 })
  @IsOptional()
  @IsNumber()
  delivery_fee?: number;

  @ApiProperty({ description: 'Delivery time', example: '2-3 business days' })
  @IsString()
  delivery_time: string;

  @ApiPropertyOptional({ description: 'Card details', type: CardInput })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardInput)
  card?: CardInput;

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

  @ApiProperty({ description: 'Payment intent data' })
  @IsObject()
  payment_intent: any;

  @ApiPropertyOptional({ description: 'Language', example: 'en', default: 'en' })
  @IsOptional()
  @IsString()
  language?: string;
}