// refunds/dto/get-refunds.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Refund, RefundStatus } from '../entities/refund.entity';

export class RefundPaginator extends Paginator<Refund> {
  @ApiProperty({ type: [Refund] })
  data: Refund[];
}

export class GetRefundDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['CREATED_AT', 'UPDATED_AT', 'AMOUNT', 'STATUS'],
    required: false
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: RefundStatus,
    required: false
  })
  status?: RefundStatus;

  @ApiProperty({
    description: 'Filter by customer ID',
    required: false
  })
  customer_id?: number;

  @ApiProperty({
    description: 'Filter by order ID',
    required: false
  })
  order_id?: number;

  // @ApiProperty({
  //   description: 'Filter by shop ID',
  //   required: false
  // })
  // shop_id?: number;
}