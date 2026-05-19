import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class Amount {
  @ApiProperty({ 
    description: 'Currency code for the amount', 
    example: 'USD', 
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD']
  })
  @IsString()
  currency_code: string;

  @ApiProperty({ 
    description: 'Amount value', 
    example: 100.50, 
    type: Number,
    minimum: 0.01
  })
  @IsNumber()
  value: number;
}

export class PurchaseUnit {
  @ApiProperty({ 
    description: 'Invoice ID for tracking', 
    example: 12345, 
    type: Number,
    required: true
  })
  @IsNumber()
  invoice_id: number;

  @ApiProperty({ 
    description: 'Amount details for this purchase unit', 
    type: () => Amount 
  })
  @ValidateNested()
  @Type(() => Amount)
  amount: Amount;

  @ApiProperty({ 
    description: 'Order description', 
    example: 'Order From Marvel Store', 
    type: String,
    required: false
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Reference ID for the purchase', 
    example: 'ORDER-12345', 
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  reference_id?: string;
}

export class ExperienceContext {
  @ApiProperty({ 
    description: 'User action for the payment flow', 
    example: 'PAY_NOW', 
    type: String,
    enum: ['PAY_NOW', 'CONTINUE']
  })
  @IsString()
  user_action: string;

  @ApiProperty({ 
    description: 'Payment method preference', 
    example: 'IMMEDIATE_PAYMENT_REQUIRED', 
    type: String,
    enum: ['IMMEDIATE_PAYMENT_REQUIRED', 'UNRESTRICTED']
  })
  @IsString()
  payment_method_preference: string;

  @ApiProperty({ 
    description: 'URL to redirect if user cancels payment', 
    example: 'https://example.com/cancel', 
    type: String,
    format: 'url'
  })
  @IsString()
  cancel_url: string;

  @ApiProperty({ 
    description: 'URL to redirect after successful payment', 
    example: 'https://example.com/return', 
    type: String,
    format: 'url'
  })
  @IsString()
  return_url: string;

  @ApiProperty({ 
    description: 'Brand name displayed on PayPal', 
    example: 'Marvel Store', 
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  brand_name?: string;

  @ApiProperty({ 
    description: 'Locale for the payment page', 
    example: 'en_US', 
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiProperty({ 
    description: 'Shipping preference', 
    example: 'SET_PROVIDED_ADDRESS', 
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  shipping_preference?: string;
}

export class PaypalSource {
  @ApiProperty({ 
    description: 'Experience context for PayPal checkout', 
    type: () => ExperienceContext 
  })
  @ValidateNested()
  @Type(() => ExperienceContext)
  experience_context: ExperienceContext;
}

export class PaymentSource {
  @ApiProperty({ 
    description: 'PayPal payment source configuration', 
    type: () => PaypalSource 
  })
  @ValidateNested()
  @Type(() => PaypalSource)
  paypal: PaypalSource;
}

export class PaypalCreateIntentParam {
  @ApiProperty({ 
    description: 'Payment intent type', 
    example: 'CAPTURE', 
    type: String,
    enum: ['CAPTURE', 'AUTHORIZE']
  })
  @IsString()
  intent: string;

  @ApiProperty({ 
    description: 'List of purchase units in this order', 
    type: () => [PurchaseUnit] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseUnit)
  purchase_units: PurchaseUnit[];

  @ApiProperty({ 
    description: 'Payment source information', 
    type: () => PaymentSource 
  })
  @ValidateNested()
  @Type(() => PaymentSource)
  payment_source: PaymentSource;
}

export class Link {
  @ApiProperty({ 
    description: 'Link URL', 
    example: 'https://api.paypal.com/v2/checkout/orders/5O190127TN364715T', 
    type: String,
    format: 'url'
  })
  href: string;

  @ApiProperty({ 
    description: 'Link relation type', 
    example: 'approve', 
    type: String,
    enum: ['self', 'approve', 'update', 'capture']
  })
  rel: string;

  @ApiProperty({ 
    description: 'HTTP method for the link', 
    example: 'GET', 
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE']
  })
  method: string;
}

export class PaypalOrderResponse {
  @ApiProperty({ 
    description: 'PayPal order ID', 
    example: '5O190127TN364715T', 
    type: String 
  })
  id: string;

  @ApiProperty({ 
    description: 'Order status', 
    example: 'CREATED', 
    type: String,
    enum: ['CREATED', 'APPROVED', 'COMPLETED', 'FAILED', 'CANCELLED']
  })
  status: string;

  @ApiProperty({ 
    description: 'Payment source used for the order', 
    type: () => PaymentSource 
  })
  payment_source: PaymentSource;

  @ApiProperty({ 
    description: 'List of HATEOAS links for order operations', 
    type: () => [Link] 
  })
  links: Link[];
}

export class CapturePaymentDto {
  @ApiProperty({ 
    description: 'PayPal order ID to capture', 
    example: '5O190127TN364715T', 
    type: String 
  })
  @IsString()
  order_id: string;

  @ApiProperty({ 
    description: 'Capture amount (if different from order amount)', 
    required: false,
    type: () => Amount
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Amount)
  capture_amount?: Amount;
}

export class RefundPaymentDto {
  @ApiProperty({ 
    description: 'PayPal capture ID to refund', 
    example: '5O190127TN364715T', 
    type: String 
  })
  @IsString()
  capture_id: string;

  @ApiProperty({ 
    description: 'Refund amount', 
    required: false,
    type: () => Amount
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Amount)
  refund_amount?: Amount;

  @ApiProperty({ 
    description: 'Reason for refund', 
    example: 'Customer requested refund', 
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateOrderResponse {
  @ApiProperty({ 
    description: 'PayPal order ID', 
    example: '5O190127TN364715T', 
    type: String 
  })
  order_id: string;

  @ApiProperty({ 
    description: 'Redirect URL for PayPal checkout', 
    example: 'https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T', 
    type: String,
    format: 'url'
  })
  redirect_url: string;

  @ApiProperty({ 
    description: 'Order status', 
    example: 'CREATED', 
    type: String 
  })
  status: string;
}

export class VerifyPaymentResponse {
  @ApiProperty({ 
    description: 'Payment ID', 
    example: '5O190127TN364715T', 
    type: String 
  })
  id: string;

  @ApiProperty({ 
    description: 'Payment status', 
    example: 'COMPLETED', 
    type: String 
  })
  status: string;

  @ApiProperty({ 
    description: 'Is payment successful', 
    example: true, 
    type: Boolean 
  })
  is_successful: boolean;

  @ApiProperty({ 
    description: 'Capture ID if payment was captured', 
    example: '5O190127TN364715T', 
    type: String,
    required: false
  })
  capture_id?: string;
}