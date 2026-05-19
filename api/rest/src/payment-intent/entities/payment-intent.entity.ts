import { ApiProperty } from '@nestjs/swagger';
import { PaymentGatewayType } from 'src/common/enums/order-payment.enum';


export class PaymentIntentInfo {
  @ApiProperty({ required: false, type: String, nullable: true })
  client_secret?: string | null;

  @ApiProperty({ required: false, type: String, nullable: true })
  redirect_url?: string | null;

  @ApiProperty({ type: String, description: 'Payment ID' })
  payment_id: string;

  @ApiProperty({ type: Boolean, description: 'Is redirect required' })
  is_redirect: boolean;
}

export class PaymentIntent {
  @ApiProperty({ type: Number, description: 'Payment intent ID' })
  id: number;

  @ApiProperty({ type: Number, description: 'Order ID' })
  order_id: number;

  @ApiProperty({ type: String, description: 'Tracking number' })
  tracking_number: string;

  @ApiProperty({ enum: PaymentGatewayType, description: 'Payment gateway' })
  payment_gateway: PaymentGatewayType;

  @ApiProperty({ type: () => PaymentIntentInfo, description: 'Payment intent info' })
  payment_intent_info: PaymentIntentInfo;
}