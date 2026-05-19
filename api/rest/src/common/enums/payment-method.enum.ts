import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethodType {
  CARD = 'card',
  PAYPAL = 'paypal',
  DIGITAL_WALLET = 'digital_wallet'
}

export enum PaymentMethodOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  NETWORK = 'network',
  TYPE = 'type'
}