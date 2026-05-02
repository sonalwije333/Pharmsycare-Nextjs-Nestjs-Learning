// refund-reasons/dto/get-refund-reasons.dto.ts
import { ApiProperty } from '@nestjs/swagger';
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
    enum: ['CREATED_AT', 'UPDATED_AT', 'NAME'],
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
    description: 'Filter by language',
    example: 'en',
    required: false
  })
  language?: string;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
}