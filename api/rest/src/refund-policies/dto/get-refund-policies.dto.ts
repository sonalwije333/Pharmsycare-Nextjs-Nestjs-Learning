// refund-policies/dto/get-refund-policies.dto.ts
import { ApiProperty } from '@nestjs/swagger';
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
    enum: ['CREATED_AT', 'UPDATED_AT', 'TITLE', 'DESCRIPTION'],
    required: false
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by target (vendor/customer)',
    enum: ['vendor', 'customer'],
    required: false
  })
  target?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['approved', 'pending', 'rejected'],
    required: false
  })
  status?: string;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TITLE = 'TITLE',
  DESCRIPTION = 'DESCRIPTION',
}