// store-notices/dto/create-store-notice.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StoreNotice, StoreNoticePriorityType } from '../entities/store-notices.entity';

export class CreateStoreNoticeDto extends PickType(StoreNotice, [
  'notice',
  'description',
  'expired_at',
  'effective_from',
  'priority',
  'type',
  'received_by',
] as const) {
  @ApiProperty({
    description: 'Notice title',
    example: 'Big Sale !!!',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  notice: string;

  @ApiProperty({
    description: 'Notice description',
    example: 'From 15, April 2023 to 30, April 2023 Every Vendor will 0.5% commission',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Effective from date',
    example: '2023-03-15 18:00:00',
    required: false
  })
  @IsString()
  @IsOptional()
  effective_from?: string;

  @ApiProperty({
    description: 'Expiration date',
    example: '2023-04-29 18:00:00',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  expired_at: string;

  @ApiProperty({
    description: 'Notice priority',
    enum: StoreNoticePriorityType,
    example: StoreNoticePriorityType.HIGH,
    default: StoreNoticePriorityType.MEDIUM
  })
  @IsEnum(StoreNoticePriorityType)
  priority: StoreNoticePriorityType;

  @ApiProperty({
    description: 'Notice type',
    example: 'all_vendor',
    required: false
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Received by user/shop IDs',
    example: ['1', '2', '3'],
    type: [String],
    required: false
  })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).join(',');
    }
    if (value === null || value === undefined) {
      return undefined;
    }
    return String(value);
  })
  @IsString()
  @IsOptional()
  received_by?: string;

  @ApiProperty({
    description: 'User IDs to send notice to',
    type: [Number],
    required: false
  })
  @IsArray()
  @IsOptional()
  user_ids?: number[];
}