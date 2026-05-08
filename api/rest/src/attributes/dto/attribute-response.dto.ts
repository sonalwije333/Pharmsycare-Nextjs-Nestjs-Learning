import { ApiProperty } from '@nestjs/swagger';
import { Attribute } from '../entities/attribute.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class AttributeResponse {
  @ApiProperty({ type: () => Attribute, description: 'Attribute data' })
  attribute: Attribute;
}

export class AttributeMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: () => Attribute, required: false, description: 'Updated attribute data' })
  attribute?: Attribute;
}

export class AttributePaginator {
  @ApiProperty({ type: () => [Attribute], description: 'Array of attributes' })
  data: Attribute[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/attributes?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/attributes?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/attributes?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/attributes?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}