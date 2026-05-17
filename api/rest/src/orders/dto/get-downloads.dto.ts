import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { SortOrder } from 'src/common/enums/enums';
import { OrderFiles } from '../entities/order.entity';
import { OrderFilesOrderByColumn } from 'src/common/enums/order-payment.enum';

export class OrderFilesPaginator {
  @ApiProperty({ type: () => [OrderFiles], description: 'Array of order files' })
  data: OrderFiles[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/downloads?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/downloads?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/downloads?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/downloads?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetOrderFilesDto extends PaginationArgs {
  @ApiProperty({ description: 'Order by column', enum: OrderFilesOrderByColumn, required: false })
  @IsOptional()
  @IsEnum(OrderFilesOrderByColumn)
  orderBy?: OrderFilesOrderByColumn = OrderFilesOrderByColumn.CREATED_AT;

  @ApiProperty({ description: 'Sort order', enum: SortOrder, required: false, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;
}