// refunds/dto/get-refunds.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Refund, RefundStatus } from '../entities/refund.entity';

export class RefundPaginator extends Paginator<Refund> {
  @ApiProperty({ type: [Refund] })
  data: Refund[];
}

export class GetRefundDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'amount', 'status'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'amount', 'status'])
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc', 'ASC', 'DESC'],
    required: false,
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: RefundStatus,
    required: false
  })
  @IsOptional()
  @IsString()
  status?: RefundStatus;

  @ApiProperty({
    description: 'Filter by customer ID',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customer_id?: number;

  @ApiProperty({
    description: 'Filter by order ID',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order_id?: number;

  @ApiProperty({
    description: 'Filter by shop ID',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shop_id?: number;

  @ApiProperty({
    description: 'Search join operator',
    enum: ['and', 'or', 'AND', 'OR'],
    required: false,
    default: 'and'
  })
  @IsOptional()
  @IsString()
  @IsIn(['and', 'or', 'AND', 'OR'])
  searchJoin?: string;

  @ApiProperty({
    description: 'Related resources to include',
    example: 'order;customer;refund_policy',
    required: false
  })
  @IsOptional()
  @IsString()
  with?: string;
}