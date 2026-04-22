// orders/dto/get-order-statuses.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { OrderStatus } from '../entities/order-status.entity';

export class OrderStatusPaginator extends Paginator<OrderStatus> {
  @ApiProperty({ type: [OrderStatus] })
  data: OrderStatus[];
}

export class GetOrderStatusesDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT', 'SERIAL'],
    required: false
  })
  orderBy?: QueryOrderStatusesOrderByColumn;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC
  })
  sortedBy?: SortOrder;

  @ApiProperty({
    description: 'Search term',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Language',
    example: 'en',
    required: false
  })
  language?: string;
}

export enum QueryOrderStatusesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
  SERIAL = 'SERIAL',
}