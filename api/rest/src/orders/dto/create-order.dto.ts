import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentGatewayType } from 'src/common/enums/order-payment.enum';


export class UserAddressInput {
  @ApiProperty({ description: 'Street address', example: '2148 Straford Park', type: String })
  @IsString()
  street_address: string;

  @ApiProperty({ description: 'Country', example: 'United States', type: String })
  @IsString()
  country: string;

  @ApiProperty({ description: 'City', example: 'Winchester', type: String })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State', example: 'KY', type: String })
  @IsString()
  state: string;

  @ApiProperty({ description: 'ZIP code', example: '40391', type: String })
  @IsString()
  zip: string;
}

export class ConnectProductOrderPivot {
  @ApiProperty({ description: 'Product ID', example: 206, type: Number })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'Variation option ID', example: 311, required: false, type: Number })
  @IsOptional()
  @IsNumber()
  variation_option_id?: number;

  @ApiProperty({ description: 'Order quantity', example: 1, type: Number })
  @IsNumber()
  order_quantity: number;

  @ApiProperty({ description: 'Unit price', example: 3.5, type: Number })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ description: 'Subtotal', example: 3.5, type: Number })
  @IsNumber()
  subtotal: number;
}

export class CardInput {
  @ApiProperty({ description: 'Card number', example: '4242424242424242', type: String })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Expiry month', example: '12', type: String })
  @IsString()
  expiryMonth: string;

  @ApiProperty({ description: 'Expiry year', example: '2025', type: String })
  @IsString()
  expiryYear: string;

  @ApiProperty({ description: 'CVV', example: '123', type: String })
  @IsString()
  cvv: string;

  @ApiProperty({ description: 'Email', example: 'customer@example.com', required: false, type: String })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Shop ID', example: 1, required: false, type: Number })
  @IsOptional()
  @IsNumber()
  shop_id?: number;

  @ApiProperty({ description: 'Coupon ID', example: 1, required: false, type: Number })
  @IsOptional()
  @IsNumber()
  coupon_id?: number;

  @ApiProperty({ description: 'Order status', example: 'order-pending', required: true, type: String })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Customer contact', example: '19365141641631', required: true, type: String })
  @IsString()
  customer_contact: string;

  @ApiProperty({ description: 'Amount', example: 14.5, type: Number })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Sales tax', example: 0.29, type: Number })
  @IsNumber()
  sales_tax: number;

  @ApiProperty({ description: 'Total', example: 64.79, type: Number })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Paid total', example: 64.79, type: Number })
  @IsNumber()
  paid_total: number;

  @ApiProperty({ description: 'Discount', example: 0, type: Number })
  @IsNumber()
  discount: number;

  @ApiProperty({ description: 'Delivery fee', example: 50, type: Number })
  @IsNumber()
  delivery_fee: number;

  @ApiProperty({ description: 'Delivery time', example: 'Express Delivery', type: String })
  @IsString()
  delivery_time: string;

  @ApiProperty({ description: 'Language', example: 'en', type: String })
  @IsString()
  language: string;

  @ApiProperty({ description: 'Products in order', type: () => [ConnectProductOrderPivot], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectProductOrderPivot)
  products: ConnectProductOrderPivot[];

  @ApiProperty({ description: 'Payment ID', example: 'pi_123456789', required: false, type: String })
  @IsOptional()
  @IsString()
  payment_id?: string;

  @ApiProperty({ description: 'Payment gateway', enum: PaymentGatewayType, default: PaymentGatewayType.CASH_ON_DELIVERY, required: false })
  @IsOptional()
  @IsEnum(PaymentGatewayType)
  payment_gateway?: PaymentGatewayType = PaymentGatewayType.CASH_ON_DELIVERY;

  @ApiProperty({ description: 'Card input for payment', type: () => CardInput, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardInput)
  card?: CardInput;

  @ApiProperty({ description: 'Billing address', type: () => UserAddressInput, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  billing_address?: UserAddressInput;

  @ApiProperty({ description: 'Shipping address', type: () => UserAddressInput, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  shipping_address?: UserAddressInput;
}