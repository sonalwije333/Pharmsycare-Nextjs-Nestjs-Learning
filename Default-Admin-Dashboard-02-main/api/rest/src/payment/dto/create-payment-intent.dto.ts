// payment/dto/paypal.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaypalCreateIntentPram {
  @ApiProperty({ example: 'CAPTURE' })
  @IsString()
  intent: string;

  @ApiProperty({ type: () => [PurchaseUnit] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseUnit)
  purchase_units: PurchaseUnit[];

  @ApiProperty({ type: () => PaymentSource })
  @ValidateNested()
  @Type(() => PaymentSource)
  payment_source: PaymentSource;
}

export class PurchaseUnit {
  @ApiProperty({ example: 12345 })
  @IsNumber()
  invoice_id: number;

  @ApiProperty({ type: () => Amount })
  @ValidateNested()
  @Type(() => Amount)
  amount: Amount;

  @ApiProperty({ example: 'Order Description' })
  @IsString()
  description: string;
}

export class Amount {
  @ApiProperty({ example: 'USD' })
  @IsString()
  currency_code: string;

  @ApiProperty({ example: 100.50 })
  @IsNumber()
  value: number;
}

export class PaymentSource {
  @ApiProperty({ type: () => PaypalSource })
  @ValidateNested()
  @Type(() => PaypalSource)
  paypal: PaypalSource;
}

export class PaypalSource {
  @ApiProperty({ type: () => ExperienceContext })
  @ValidateNested()
  @Type(() => ExperienceContext)
  experience_context: ExperienceContext;
}

export class ExperienceContext {
  @ApiProperty({ example: 'PAY_NOW' })
  @IsString()
  user_action: string;

  @ApiProperty({ example: 'IMMEDIATE_PAYMENT_REQUIRED' })
  @IsString()
  payment_method_preference: string;

  @ApiProperty({ example: 'https://example.com/cancel' })
  @IsString()
  cancel_url: string;

  @ApiProperty({ example: 'https://example.com/return' })
  @IsString()
  return_url: string;
}

export class PaypalOrderResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  payment_source: PaymentSource;

  @ApiProperty({ type: () => [Link] })
  links: Link[];
}

export class Link {
  @ApiProperty()
  href: string;

  @ApiProperty()
  rel: string;

  @ApiProperty()
  method: string;
}