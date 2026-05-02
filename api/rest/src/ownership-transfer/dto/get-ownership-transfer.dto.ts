// ownership-transfer/dto/get-ownership-transfer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { OwnershipTransfer } from '../entities/ownership-transfer.entity';

export class OwnershipTransferPaginator extends Paginator<OwnershipTransfer> {
  @ApiProperty({ type: [OwnershipTransfer] })
  data: OwnershipTransfer[];
}

export class GetOwnershipTransferDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: ['CREATED_AT', 'UPDATED_AT', 'TRANSACTION_IDENTIFIER'],
    required: false
  })
  orderBy?: QueryOwnershipTransferOrderByColumn;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC
  })
  sortedBy?: SortOrder;

  @ApiProperty({
    description: 'Search term',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['pending', 'approved', 'rejected', 'completed'],
    required: false
  })
  status?: string;

  @ApiProperty({
    description: 'Filter by previous owner ID',
    example: 48,
    required: false
  })
  previous_owner_id?: number;

  @ApiProperty({
    description: 'Filter by current owner ID',
    example: 49,
    required: false
  })
  current_owner_id?: number;
}

export enum QueryOwnershipTransferOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TRANSACTION_IDENTIFIER = 'TRANSACTION_IDENTIFIER',
}