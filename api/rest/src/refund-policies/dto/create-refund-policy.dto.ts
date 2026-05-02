// refund-policies/dto/create-refund-policy.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RefundPolicy } from '../entities/refund-policies.entity';

export class CreateRefundPolicyDto extends PickType(RefundPolicy, [
  'title',
  'status',
  'target',
] as const) {
  @ApiProperty({
    description: 'Policy description',
    example: 'Our vendor return policy ensures that you can return products within 30 days...',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Policy language',
    example: 'en',
    default: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;
}