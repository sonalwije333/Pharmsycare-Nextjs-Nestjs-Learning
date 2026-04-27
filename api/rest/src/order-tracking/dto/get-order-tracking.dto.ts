// order-tracking/dto/get-order-tracking.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { TrackingStatus } from '../entities/order-tracking.entity';
import { OrderTracking } from '../entities/order-tracking.entity';

export class GetOrderTrackingDto extends PaginationArgs {
  @ApiProperty({ description: 'Filter by order ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order_id?: number;

  @ApiProperty({ description: 'Filter by tracking status', enum: TrackingStatus, required: false })
  @IsOptional()
  @IsEnum(TrackingStatus)
  status?: TrackingStatus;

  @ApiProperty({ description: 'Search by tracking number or carrier', example: 'TRK123', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Sort by field', example: 'created_at', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order (asc or desc)', example: 'desc', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class OrderTrackingPaginator {
  data: OrderTracking[];
  paging: {
    total: number;
    limit: number;
    page: number;
  };
}
