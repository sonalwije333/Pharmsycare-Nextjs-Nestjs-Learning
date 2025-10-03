import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Refund, } from '../entities/refund.entity';
import {QueryRefundsOrderByColumn, RefundStatus} from "../../../common/enums/enums";

export class RefundPaginator extends Paginator<Refund> {}

export class GetRefundsDto extends PaginationArgs {
  @ApiPropertyOptional({
    description: 'Order by column',
    enum: QueryRefundsOrderByColumn
  })
  @IsOptional()
  @IsEnum(QueryRefundsOrderByColumn)
  orderBy?: QueryRefundsOrderByColumn;

  // @ApiPropertyOptional({
  //     description: 'Sort order',
  //     enum: SortOrder
  // })
  // @IsOptional()
  // @IsEnum(SortOrder)
  // sortedBy?: SortOrder;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: RefundStatus })
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;

  @ApiPropertyOptional({ description: 'Filter by shop ID' })
  @IsOptional()
  @IsNumber()
  shop_id?: number;

  @ApiPropertyOptional({ description: 'Filter by customer ID' })
  @IsOptional()
  @IsNumber()
  customer_id?: number;

  @ApiPropertyOptional({ description: 'Filter by order ID' })
  @IsOptional()
  @IsNumber()
  order_id?: number;
}

