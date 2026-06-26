// payment-intent/entities/payment-intent.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaymentIntentInfo {
  @ApiProperty({ required: false })
  client_secret?: string | null;

  @ApiProperty({ required: false })
  redirect_url?: string | null;

  @ApiProperty()
  payment_id: string;

  @ApiProperty()
  is_redirect: boolean;
}

export class PaymentIntent {
  @ApiProperty()
  id: number;

  @ApiProperty()
  order_id: number;

  @ApiProperty()
  tracking_number: string;

  @ApiProperty()
  payment_gateway: string;

  @ApiProperty({ type: PaymentIntentInfo })
  payment_intent_info: PaymentIntentInfo;
}