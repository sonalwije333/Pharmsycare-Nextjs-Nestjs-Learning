// order-tracking/dto/create-order-tracking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsOptional, IsDate } from 'class-validator';
import { TrackingStatus } from '../entities/order-tracking.entity';

export class CreateOrderTrackingDto {
  @ApiProperty({ description: 'Order ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  order_id: number;

  @ApiProperty({ description: 'Tracking number', example: 'TRK123456789', required: false })
  @IsOptional()
  @IsString()
  tracking_number?: string;

  @ApiProperty({ description: 'Carrier/Courier name', example: 'FedEx', required: false })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiProperty({ description: 'Current location', example: 'New York, NY', required: false })
  @IsOptional()
  @IsString()
  current_location?: string;

  @ApiProperty({ description: 'Estimated delivery date', example: '2024-02-15', required: false })
  @IsOptional()
  estimated_delivery_date?: Date;

  @ApiProperty({ description: 'Initial notes', example: 'Order confirmed and ready to ship', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
