import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Order } from '../entities/order.entity';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { QueryOrdersOrderByColumn } from '../../../common/enums/enums';

export class OrderPaginator extends Paginator<Order> {
}

export class GetOrdersDto extends PaginationArgs {
  @ApiPropertyOptional({
    description: 'Order by column',
    enum: QueryOrdersOrderByColumn,
    example: QueryOrdersOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @Transform(({ value }) => value?.toString()?.toUpperCase())
  @IsEnum(QueryOrdersOrderByColumn)
  orderBy?: QueryOrdersOrderByColumn;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @Transform(({ value }) => value?.toString()?.toLowerCase())
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ description: 'Search query', example: 'ORD-123' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Customer ID filter', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customer_id?: number;

  @ApiPropertyOptional({ description: 'Shop ID filter', example: '1' })
  @IsOptional()
  @IsString()
  shop_id?: string;

  @ApiPropertyOptional({
    description: 'Tracking number filter',
    example: 'TRK-123',
  })
  @IsOptional()
  @IsString()
  tracking_number?: string;
}
