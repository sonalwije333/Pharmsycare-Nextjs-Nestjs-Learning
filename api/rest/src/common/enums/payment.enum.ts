import { ApiProperty } from '@nestjs/swagger';

export enum PayPalPaymentStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PayPalPaymentIntent {
  CAPTURE = 'CAPTURE',
  AUTHORIZE = 'AUTHORIZE'
}

export enum StripePaymentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_ACTION = 'requires_action',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

export enum StripePaymentMethodType {
  CARD = 'card',
  IDEAL = 'ideal',
  SOFORT = 'sofort',
  SEPA_DEBIT = 'sepa_debit',
  BANCONTACT = 'bancontact',
  EPS = 'eps',
  GIROPAY = 'giropay',
  P24 = 'p24'
}

export enum PaymentGatewayType {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  RAZORPAY = 'RAZORPAY',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
}