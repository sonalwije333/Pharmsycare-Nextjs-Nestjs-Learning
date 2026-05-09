import { ApiProperty } from '@nestjs/swagger';

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

export enum AddressOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  TITLE = 'title',
}