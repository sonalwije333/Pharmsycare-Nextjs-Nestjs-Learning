// addresses/dto/address-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Address } from '../entities/address.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class AddressResponse {
  @ApiProperty({ type: Address })
  address: Address;
}

export class AddressMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: Address, required: false })
  address?: Address;
}

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

  @ApiProperty({ example: '/address?page=2' })
  next_page_url: string | null;

  @ApiProperty({ example: '/address?page=1' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 10 })
  to: number;
}
