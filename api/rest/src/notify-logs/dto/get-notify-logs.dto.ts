// notify-logs/dto/get-notify-logs.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { NotifyLogs } from '../entities/notify-logs.entity';

export class NotifyLogsPaginator extends Paginator<NotifyLogs> {
  @ApiProperty({ type: [NotifyLogs] })
  data: NotifyLogs[];
}

export class GetNotifyLogsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: ['CREATED_AT', 'UPDATED_AT'],
    required: false
  })
  orderBy?: QueryReviewsOrderByColumn;

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
    description: 'Receiver ID',
    example: 1,
    required: false
  })
  receiver?: number;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}