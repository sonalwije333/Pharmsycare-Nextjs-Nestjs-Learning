import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class Amount {
  @ApiProperty({ example: 'USD', type: String, description: 'Currency code' })
  @IsString()
  currency_code: string;

  @ApiProperty({ example: 100.50, type: Number, description: 'Amount value' })
  @IsNumber()
  value: number;
}

export class PurchaseUnit {
  @ApiProperty({ example: 12345, type: Number, description: 'Invoice ID' })
  @IsNumber()
  invoice_id: number;

  @ApiProperty({ type: () => Amount, description: 'Amount details' })
  @ValidateNested()
  @Type(() => Amount)
  amount: Amount;

  @ApiProperty({ example: 'Order Description', type: String, description: 'Order description' })
  @IsString()
  description: string;
}

export class ExperienceContext {
  @ApiProperty({ example: 'PAY_NOW', type: String, description: 'User action' })
  @IsString()
  user_action: string;

  @ApiProperty({ example: 'IMMEDIATE_PAYMENT_REQUIRED', type: String, description: 'Payment method preference' })
  @IsString()
  payment_method_preference: string;

  @ApiProperty({ example: 'https://example.com/cancel', type: String, description: 'Cancel URL' })
  @IsString()
  cancel_url: string;

  @ApiProperty({ example: 'https://example.com/return', type: String, description: 'Return URL' })
  @IsString()
  return_url: string;
}

export class PaypalSource {
  @ApiProperty({ type: () => ExperienceContext, description: 'Experience context' })
  @ValidateNested()
  @Type(() => ExperienceContext)
  experience_context: ExperienceContext;
}

export class PaymentSource {
  @ApiProperty({ type: () => PaypalSource, description: 'PayPal source' })
  @ValidateNested()
  @Type(() => PaypalSource)
  paypal: PaypalSource;
}

export class PaypalCreateIntentParam {
  @ApiProperty({ example: 'CAPTURE', type: String, description: 'Intent type' })
  @IsString()
  intent: string;

  @ApiProperty({ type: () => [PurchaseUnit], description: 'Purchase units' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseUnit)
  purchase_units: PurchaseUnit[];

  @ApiProperty({ type: () => PaymentSource, description: 'Payment source' })
  @ValidateNested()
  @Type(() => PaymentSource)
  payment_source: PaymentSource;
}

export class Link {
  @ApiProperty({ type: String, description: 'Link href' })
  href: string;

  @ApiProperty({ type: String, description: 'Link relation' })
  rel: string;

  @ApiProperty({ type: String, description: 'HTTP method' })
  method: string;
}

export class PaypalOrderResponse {
  @ApiProperty({ type: String, description: 'Order ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Order status' })
  status: string;

  @ApiProperty({ type: () => PaymentSource, description: 'Payment source' })
  payment_source: PaymentSource;

  @ApiProperty({ type: () => [Link], description: 'Links' })
  links: Link[];
}