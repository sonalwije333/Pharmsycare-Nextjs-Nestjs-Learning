// refund-reasons/dto/get-refund-reasons.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { RefundReason } from '../entities/refund-reasons.entity';

export class RefundReasonPaginator extends Paginator<RefundReason> {
  @ApiProperty({ type: [RefundReason] })
  data: RefundReason[];
}

export class GetRefundReasonDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'name'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'name'])
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
    description: 'Filter by language',
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

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
}