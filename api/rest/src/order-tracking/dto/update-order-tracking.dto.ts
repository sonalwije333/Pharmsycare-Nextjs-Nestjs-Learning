// order-tracking/dto/update-order-tracking.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrderTrackingDto } from './create-order-tracking.dto';
import { IsOptional, IsEnum, IsString, IsInt } from 'class-validator';
import { TrackingStatus } from '../entities/order-tracking.entity';

export class UpdateOrderTrackingDto extends PartialType(CreateOrderTrackingDto) {
  @ApiProperty({ description: 'Current tracking status', enum: TrackingStatus, required: false })
  @IsOptional()
  @IsEnum(TrackingStatus)
  status?: TrackingStatus;

  @ApiProperty({ description: 'Updated notes', example: 'Package in transit', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Updated by (staff ID)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  updated_by?: number;

  @ApiProperty({ description: 'Tracking details JSON', required: false })
  @IsOptional()
  tracking_details?: { steps?: string[]; updates?: any[] };

  @ApiProperty({ description: 'Actual delivery date', example: '2024-02-14', required: false })
  @IsOptional()
  actual_delivery_date?: Date;
}
