// orders/dto/get-downloads.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { OrderFiles } from '../entities/order.entity';

export class OrderFilesPaginator extends Paginator<OrderFiles> {
  @ApiProperty({ type: [OrderFiles] })
  data: OrderFiles[];
}

export class GetOrderFilesDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT'],
    required: false
  })
  orderBy?: QueryOrderFilesOrderByColumn;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC
  })
  sortedBy?: SortOrder;
}

export enum QueryOrderFilesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}