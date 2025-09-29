import { Order } from '../entities/order.entity';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import {QueryOrdersOrderByColumn} from "../../../common/enums/enums";

export class OrderPaginator extends Paginator<Order> {}

export class GetOrdersDto extends PaginationArgs {
  @ApiPropertyOptional({
    description: 'Order by column',
    enum: QueryOrdersOrderByColumn,
    example: QueryOrdersOrderByColumn.CREATED_AT
  })
  @IsOptional()
  @IsEnum(QueryOrdersOrderByColumn)
  orderBy?: QueryOrdersOrderByColumn;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ description: 'Search query', example: 'ORD-123' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Customer ID filter', example: 1 })
  @IsOptional()
  @IsNumber()
  customer_id?: number;

  @ApiPropertyOptional({ description: 'Shop ID filter', example: 'shop-123' })
  @IsOptional()
  @IsString()
  shop_id?: string;

  @ApiPropertyOptional({ description: 'Tracking number filter', example: 'TRK-123' })
  @IsOptional()
  @IsString()
  tracking_number?: string;
}

export class GetOrderArgs {
  @ApiPropertyOptional({ description: 'Order ID', example: 1 })
  id?: number;

  @ApiPropertyOptional({ description: 'Tracking number', example: 'TRK-123' })
  tracking_number?: string;
}