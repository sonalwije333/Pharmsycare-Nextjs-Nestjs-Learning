import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
  LOCAL_FACILITY = 'localFacility',
  OUT_FOR_DELIVERY = 'outForDelivery',
}