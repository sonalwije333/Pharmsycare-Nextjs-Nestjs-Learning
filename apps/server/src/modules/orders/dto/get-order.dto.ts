import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderStatus } from '../entities/order-status.entity';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { QueryOrderStatusesOrderByColumn } from '../../../common/enums/enums';

export class OrderStatusPaginator extends Paginator<OrderStatus> {
}

export class GetOrderStatusesDto extends PaginationArgs {
  @ApiPropertyOptional({
    description: 'Order by column',
    enum: QueryOrderStatusesOrderByColumn,
    example: QueryOrderStatusesOrderByColumn.SERIAL,
  })
  @IsOptional()
  @Transform(({ value }) => value?.toString()?.toUpperCase())
  @IsEnum(QueryOrderStatusesOrderByColumn)
  orderBy?: QueryOrderStatusesOrderByColumn;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.ASC,
  })
  @IsOptional()
  @Transform(({ value }) => value?.toString()?.toLowerCase())
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ description: 'Search query', example: 'processing' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;
}
