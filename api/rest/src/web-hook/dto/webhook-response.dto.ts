// web-hook/dto/webhook-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class WebhookResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Response message', example: 'Webhook processed successfully' })
  message: string;

  @ApiProperty({ description: 'Webhook data', required: false })
  data?: any;
}

export class RazorpayWebhookDto {
  @ApiProperty({ description: 'Razorpay event type', example: 'payment.captured' })
  event: string;

  @ApiProperty({ description: 'Payment payload', type: 'object' })
  payload: any;

  @ApiProperty({ description: 'Webhook signature', required: false })
  signature?: string;
}

export class StripeWebhookDto {
  @ApiProperty({ description: 'Stripe event type', example: 'payment_intent.succeeded' })
  type: string;

  @ApiProperty({ description: 'Event data object', type: 'object' })
  data: {
    object: any;
  };

  @ApiProperty({ description: 'Stripe account ID', required: false })
  account?: string;
}

export class PaypalWebhookDto {
  @ApiProperty({ description: 'PayPal event type', example: 'PAYMENT.CAPTURE.COMPLETED' })
  event_type: string;

  @ApiProperty({ description: 'Resource data', type: 'object' })
  resource: any;

  @ApiProperty({ description: 'Webhook ID', required: false })
  id?: string;

  @ApiProperty({ description: 'Create time', required: false })
  create_time?: string;
}