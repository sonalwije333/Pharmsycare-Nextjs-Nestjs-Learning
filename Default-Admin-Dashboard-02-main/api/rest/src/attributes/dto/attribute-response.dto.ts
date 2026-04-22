// attributes/dto/attribute-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Attribute } from '../entities/attribute.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class AttributeResponse {
  @ApiProperty({ type: Attribute })
  attribute: Attribute;
}

export class AttributeMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: Attribute, required: false })
  attribute?: Attribute;
}

export class AttributePaginator {
  @ApiProperty({ type: [Attribute] })
  data: Attribute[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 30 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/attributes?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/attributes?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/attributes?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/attributes?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 30 })
  to: number;
}
