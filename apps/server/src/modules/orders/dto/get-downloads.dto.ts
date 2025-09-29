import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderFiles } from '../entities/order.entity';
import {QueryOrderFilesOrderByColumn} from "../../../common/enums/enums";
import {Paginator} from "../../common/dto/paginator.dto";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";
import { SortOrder } from '../../common/dto/generic-conditions.dto';

export class OrderFilesPaginator extends Paginator<OrderFiles> {
  // data: OrderFiles[];
}

export class GetOrderFilesDto extends PaginationArgs {
  @ApiPropertyOptional({
    description: 'Order by column',
    enum: QueryOrderFilesOrderByColumn,
    example: QueryOrderFilesOrderByColumn.CREATED_AT
  })
  @IsOptional()
  @IsEnum(QueryOrderFilesOrderByColumn)
  orderBy?: QueryOrderFilesOrderByColumn;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}