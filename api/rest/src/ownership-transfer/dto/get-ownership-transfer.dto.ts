import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { OwnershipTransfer } from '../entities/ownership-transfer.entity';
import { OwnershipTransferOrderByColumn, OwnershipTransferStatus } from 'src/common/enums/ownership-transfer.enum';

export class OwnershipTransferPaginator {
  @ApiProperty({ type: () => [OwnershipTransfer], description: 'Array of ownership transfers' })
  data: OwnershipTransfer[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/ownership-transfer?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/ownership-transfer?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/ownership-transfer?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/ownership-transfer?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetOwnershipTransferDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: OwnershipTransferOrderByColumn,
    required: false,
    default: OwnershipTransferOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(OwnershipTransferOrderByColumn)
  orderBy?: OwnershipTransferOrderByColumn = OwnershipTransferOrderByColumn.CREATED_AT;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;

  @ApiProperty({
    description: 'Search term',
    required: false,
    type: String,
    example: 'pending',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: OwnershipTransferStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OwnershipTransferStatus)
  status?: OwnershipTransferStatus;

  @ApiProperty({
    description: 'Filter by previous owner ID',
    example: 48,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  previous_owner_id?: number;

  @ApiProperty({
    description: 'Filter by current owner ID',
    example: 49,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current_owner_id?: number;
}