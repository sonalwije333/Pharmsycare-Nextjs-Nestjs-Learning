// addresses/dto/get-addresses.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Address } from '../entities/address.entity';

// Add AddressPaginator export
export class AddressPaginator {
  @ApiProperty({ type: [Address] })
  data: Address[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 10 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/address?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/address?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/address?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/address?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 10 })
  to: number;
}

export class GetAddressesDto extends PaginationArgs {
  @ApiProperty({
    description: 'Filter by customer ID',
    required: false,
    example: 1,
  })
  customer_id?: number;

  @ApiProperty({
    description: 'Filter by address type',
    enum: ['billing', 'shipping'],
    required: false,
  })
  type?: string;

  @ApiProperty({
    description: 'Search text',
    required: false,
  })
  text?: string;

  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'title'],
    required: false,
    default: 'created_at',
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC',
  })
  sortedBy?: string;
}
