// attributes/dto/get-attribute.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GetAttributeArgs {
  @ApiProperty({
    description: 'Attribute ID',
    example: 1,
    required: false,
  })
  id?: number;

  @ApiProperty({
    description: 'Attribute slug',
    example: 'color',
    required: false,
  })
  slug?: string;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false,
    default: 'en',
  })
  language?: string;
}
