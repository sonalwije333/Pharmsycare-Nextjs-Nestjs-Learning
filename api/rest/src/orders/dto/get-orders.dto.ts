// orders/dto/get-orders.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Order } from '../entities/order.entity';

export class OrderPaginator extends Paginator<Order> {
  @ApiProperty({ type: [Order] })
  data: Order[];
}

export class GetOrdersDto extends PaginationArgs {
  @ApiProperty({
    description: 'Tracking number',
    example: '20240207303639',
    required: false
  })
  @IsOptional()
  @IsString()
  tracking_number?: string;

  @ApiProperty({
    description: 'Order by field',
    example: 'created_at',
    required: false
  })
  @IsOptional()
  @IsString()
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
    description: 'Customer ID',
    example: 2,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customer_id?: number;

  @ApiProperty({
    description: 'Shop ID',
    example: '6',
    required: false
  })
  @IsOptional()
  @IsString()
  shop_id?: string;

  @ApiProperty({
    description: 'Search term',
    example: 'order',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Language',
    example: 'en',
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

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
}