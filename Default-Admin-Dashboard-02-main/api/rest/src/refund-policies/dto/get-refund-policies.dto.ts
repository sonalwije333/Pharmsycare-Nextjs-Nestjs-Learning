// refund-policies/dto/get-refund-policies.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { RefundPolicy } from '../entities/refund-policies.entity';

export class RefundPolicyPaginator extends Paginator<RefundPolicy> {
  @ApiProperty({ type: [RefundPolicy] })
  data: RefundPolicy[];
}

export class GetRefundPolicyDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'title', 'description'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'title', 'description'])
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
    description: 'Filter by target (vendor/customer)',
    enum: ['vendor', 'customer'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['vendor', 'customer'])
  target?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['approved', 'pending', 'rejected'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['approved', 'pending', 'rejected'])
  status?: string;

  @ApiProperty({
    description: 'Language code',
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

  @ApiProperty({
    description: 'Relations to eager load (comma-separated)',
    example: 'shop,refunds',
    required: false
  })
  @IsOptional()
  @IsString()
  with?: string;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TITLE = 'TITLE',
  DESCRIPTION = 'DESCRIPTION',
}