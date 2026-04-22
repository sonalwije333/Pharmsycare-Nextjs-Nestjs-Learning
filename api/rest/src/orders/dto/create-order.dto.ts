// orders/dto/create-order.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Order } from '../entities/order.entity';
// import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity'; // Commented for future use

export enum PaymentGatewayType {
  STRIPE = 'STRIPE',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CASH = 'CASH',
  FULL_WALLET_PAYMENT = 'FULL_WALLET_PAYMENT',
  PAYPAL = 'PAYPAL',
  RAZORPAY = 'RAZORPAY',
}

export class UserAddressInput {
  @ApiProperty({ description: 'Street address', example: '2148 Straford Park' })
  @IsString()
  street_address: string;

  @ApiProperty({ description: 'Country', example: 'United States' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'City', example: 'Winchester' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State', example: 'KY' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'ZIP code', example: '40391' })
  @IsString()
  zip: string;
}

export class ConnectProductOrderPivot {
  @ApiProperty({ description: 'Product ID', example: 206 })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'Variation option ID', example: 311, required: false })
  @IsOptional()
  @IsNumber()
  variation_option_id?: number;

  @ApiProperty({ description: 'Order quantity', example: 1 })
  @IsNumber()
  order_quantity: number;

  @ApiProperty({ description: 'Unit price', example: 3.5 })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ description: 'Subtotal', example: 3.5 })
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

  @ApiProperty({ description: 'Email', example: 'customer@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateOrderDto extends PickType(Order, [
  'customer_contact',
  'amount',
  'sales_tax',
  'total',
  'paid_total',
  'discount',
  'delivery_fee',
  'delivery_time',
  'language',
] as const) {
  @ApiProperty({
    description: 'Shop ID',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  shop_id?: number;

  @ApiProperty({
    description: 'Coupon ID',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  coupon_id?: number;

  @ApiProperty({
    description: 'Order status',
    example: 'order-pending',
    required: true
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Customer contact',
    example: '19365141641631',
    required: true
  })
  @IsString()
  customer_contact: string;

  @ApiProperty({
    description: 'Products in order',
    type: () => [ConnectProductOrderPivot],
    required: true
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectProductOrderPivot)
  products: ConnectProductOrderPivot[];

  @ApiProperty({
    description: 'Payment ID',
    example: 'pi_123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  payment_id?: string;

  @ApiProperty({
    description: 'Payment gateway',
    enum: PaymentGatewayType,
    default: PaymentGatewayType.CASH_ON_DELIVERY,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentGatewayType)
  payment_gateway?: PaymentGatewayType;

  @ApiProperty({
    description: 'Card input for payment',
    type: () => CardInput,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardInput)
  card?: CardInput;

  @ApiProperty({
    description: 'Billing address',
    type: () => UserAddressInput,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  billing_address?: UserAddressInput;

  @ApiProperty({
    description: 'Shipping address',
    type: () => UserAddressInput,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  shipping_address?: UserAddressInput;

  // @ApiProperty({ // Commented for future use
  //   description: 'Payment intent',
  //   type: () => PaymentIntent,
  //   required: false
  // })
  // @IsOptional()
  // @ValidateNested()
  // @Type(() => PaymentIntent)
  // payment_intent?: PaymentIntent;
}