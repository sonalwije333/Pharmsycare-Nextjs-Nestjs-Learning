// ownership-transfer/dto/get-ownership-transfer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
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
    enum: ['CREATED_AT', 'UPDATED_AT', 'TRANSACTION_IDENTIFIER', 'created_at', 'updated_at', 'transaction_identifier'],
    required: false
  })
  @IsOptional()
  @IsIn(['CREATED_AT', 'UPDATED_AT', 'TRANSACTION_IDENTIFIER', 'created_at', 'updated_at', 'transaction_identifier'])
  orderBy?: QueryOwnershipTransferOrderByColumn;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortedBy?: SortOrder;

  @ApiProperty({
    description: 'Search term',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'How to join search conditions',
    enum: ['and', 'or'],
    required: false,
  })
  @IsOptional()
  @IsIn(['and', 'or', 'AND', 'OR'])
  searchJoin?: string;

  @ApiProperty({
    description: 'Language code',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Relations to include (comma-separated)',
    required: false,
  })
  @IsOptional()
  @IsString()
  with?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['pending', 'approved', 'rejected', 'completed'],
    required: false
  })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'completed'])
  status?: string;

  @ApiProperty({
    description: 'Filter by previous owner ID',
    example: 48,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  previous_owner_id?: number;

  @ApiProperty({
    description: 'Filter by current owner ID',
    example: 49,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current_owner_id?: number;
}

export enum QueryOwnershipTransferOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TRANSACTION_IDENTIFIER = 'TRANSACTION_IDENTIFIER',
}