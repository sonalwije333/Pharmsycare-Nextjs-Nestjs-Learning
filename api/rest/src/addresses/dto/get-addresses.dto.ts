import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { Address } from '../entities/address.entity';
import { AddressOrderByColumn, AddressType } from 'src/common/enums/address-type.enum';

export class AddressPaginator {
  @ApiProperty({ type: () => [Address], description: 'Array of addresses' })
  data: Address[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 10, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/address?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/address?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/address?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/address?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 10, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetAddressesDto extends PaginationArgs {
  @ApiProperty({
    description: 'Filter by customer ID',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  customer_id?: number;

  @ApiProperty({
    description: 'Filter by address type',
    enum: AddressType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType;

  @ApiProperty({
    description: 'Search text',
    required: false,
    type: String,
    example: 'Home',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({
    description: 'Column to order by',
    enum: AddressOrderByColumn,
    required: false,
    default: AddressOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(AddressOrderByColumn)
  orderBy?: AddressOrderByColumn = AddressOrderByColumn.CREATED_AT;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;
}