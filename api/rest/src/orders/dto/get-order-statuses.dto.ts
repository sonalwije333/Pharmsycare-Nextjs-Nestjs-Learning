import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SortOrder } from 'src/common/enums/enums';
import { OrderStatus } from '../entities/order-status.entity';
import { OrderStatusOrderByColumn } from 'src/common/enums/order-payment.enum';

export class OrderStatusPaginator {
  @ApiProperty({ type: () => [OrderStatus], description: 'Array of order statuses' })
  data: OrderStatus[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/order-status?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/order-status?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/order-status?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/order-status?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetOrderStatusesDto extends PaginationArgs {
  @ApiProperty({ description: 'Order by column', enum: OrderStatusOrderByColumn, required: false })
  @IsOptional()
  @IsEnum(OrderStatusOrderByColumn)
  orderBy?: OrderStatusOrderByColumn = OrderStatusOrderByColumn.CREATED_AT;

  @ApiProperty({ description: 'Sort order', enum: SortOrder, required: false, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;

  @ApiProperty({ description: 'Search term', required: false, type: String, example: 'received' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Language', example: 'en', required: false, type: String })
  @IsOptional()
  @IsString()
  language?: string = 'en';
}