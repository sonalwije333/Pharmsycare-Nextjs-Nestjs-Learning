import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsNumber, IsEnum, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { Order } from '../entities/order.entity';
import { OrderOrderByColumn } from 'src/common/enums/order-payment.enum';

export class OrderPaginator {
  @ApiProperty({ type: () => [Order], description: 'Array of orders' })
  data: Order[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/orders?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/orders?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/orders?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/orders?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetOrdersDto extends PaginationArgs {
  @ApiProperty({ description: 'Language code', example: 'en', required: false, default: 'en', type: String })
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @ApiProperty({ description: 'Tracking number', example: '20240207303639', required: false, type: String })
  @IsOptional()
  @IsString()
  tracking_number?: string;

  @ApiProperty({ description: 'Customer ID', example: 2, required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customer_id?: number;

  @ApiProperty({ description: 'Shop ID', example: '6', required: false, type: String })
  @IsOptional()
  @IsString()
  shop_id?: string;

  @ApiProperty({ description: 'Search term', example: 'order', required: false, type: String })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'How to join search conditions',
    enum: ['and', 'or'],
    required: false,
  })
  @IsOptional()
  @IsIn(['and', 'or', 'AND', 'OR'])
  searchJoin?: string;

  @ApiProperty({ description: 'Order by field', enum: OrderOrderByColumn, required: false, default: OrderOrderByColumn.CREATED_AT })
  @IsOptional()
  @IsEnum(OrderOrderByColumn)
  orderBy?: OrderOrderByColumn = OrderOrderByColumn.CREATED_AT;

  @ApiProperty({ description: 'Sort order', enum: SortOrder, required: false, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;
}