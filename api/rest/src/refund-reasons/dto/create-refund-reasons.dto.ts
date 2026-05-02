// refund-reasons/dto/create-refund-reasons.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { RefundReason } from '../entities/refund-reasons.entity';

export class CreateRefundReasonDto extends PickType(RefundReason, ['name'] as const) {
  @ApiProperty({
    description: 'Reason language',
    example: 'en',
    default: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;
}