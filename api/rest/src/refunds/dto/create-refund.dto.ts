// refunds/dto/create-refund.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RefundStatus } from '../entities/refund.entity';

export class CreateRefundDto {
  @ApiProperty({
    description: 'Refund amount',
    example: 99.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Refund status',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
    required: false
  })
  @IsEnum(RefundStatus)
  @IsOptional()
  status?: RefundStatus;

  @ApiProperty({
    description: 'Order ID associated with refund',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  order_id: number;

  @ApiProperty({
    description: 'Customer ID associated with refund',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  customer_id: number;

  @ApiProperty({
    description: 'Shop ID associated with refund',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  shop_id?: number;

  @ApiProperty({
    description: 'Refund reason',
    example: 'Product damaged',
    required: false
  })
  @IsString()
  @IsOptional()
  reason?: string;
}