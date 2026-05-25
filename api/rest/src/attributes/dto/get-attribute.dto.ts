// attributes/dto/get-attribute.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAttributeArgs {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Attribute ID',
    example: 1,
    required: false,
  })
  id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Attribute slug',
    example: 'color',
    required: false,
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false,
    default: 'en',
  })
  language?: string;
}
