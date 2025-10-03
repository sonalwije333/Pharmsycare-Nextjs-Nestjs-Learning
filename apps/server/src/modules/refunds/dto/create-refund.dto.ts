import { OmitType } from '@nestjs/swagger';
import { Refund } from '../entities/refund.entity';

export class CreateRefundDto extends OmitType(Refund, [
  'id',
  'shop',
  'order',
  'customer',
  'status',
  'refunded_at',
  'created_at',
  'updated_at',
]) {}