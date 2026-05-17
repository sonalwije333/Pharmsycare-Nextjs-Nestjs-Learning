import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { NotifyLogs } from '../entities/notify-logs.entity';
import { NotifyLogsOrderByColumn } from 'src/common/enums/notify-logs-order-by.enum';

export class NotifyLogsPaginator {
  @ApiProperty({ type: () => [NotifyLogs], description: 'Array of notification logs' })
  data: NotifyLogs[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/notify-logs?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/notify-logs?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/notify-logs?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/notify-logs?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetNotifyLogsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: NotifyLogsOrderByColumn,
    required: false,
    default: NotifyLogsOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(NotifyLogsOrderByColumn)
  orderBy?: NotifyLogsOrderByColumn = NotifyLogsOrderByColumn.CREATED_AT;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;

  @ApiProperty({
    description: 'Search term',
    required: false,
    type: String,
    example: 'order',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Receiver ID or email',
    example: 1,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  receiver?: number;

  @ApiProperty({
    description: 'Filter by read status',
    example: false,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  is_read?: boolean;
}