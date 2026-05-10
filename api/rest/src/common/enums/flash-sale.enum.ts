import { ApiProperty } from '@nestjs/swagger';

export enum FlashSaleType {
  PERCENTAGE = 'percentage',
  FIXED_RATE = 'fixed_rate',
}

export enum FlashSaleOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  TITLE = 'title',
  START_DATE = 'start_date',
  END_DATE = 'end_date',
}