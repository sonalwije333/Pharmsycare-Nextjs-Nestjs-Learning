import { ApiProperty } from '@nestjs/swagger';
import { Address } from '../entities/address.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class AddressResponse {
  @ApiProperty({ type: () => Address, description: 'Address data' })
  address: Address;
}

export class AddressMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: () => Address, required: false, description: 'Updated address data' })
  address?: Address;
}

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