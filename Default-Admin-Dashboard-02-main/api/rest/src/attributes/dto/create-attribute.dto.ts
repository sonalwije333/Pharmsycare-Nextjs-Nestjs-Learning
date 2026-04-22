// attributes/dto/create-attribute.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Attribute } from '../entities/attribute.entity';

export class AttributeValueDto {
  @ApiProperty({
    description: 'Attribute value ID',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({
    description: 'Attribute value',
    example: 'Red',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Meta information (e.g., color code)',
    example: '#FF0000',
    required: false,
  })
  @IsString()
  @IsOptional()
  meta?: string;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false,
    default: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string;
}

export class CreateAttributeDto extends PickType(Attribute, [
  'name',
  'shop_id',
  'language',
] as const) {
  @ApiProperty({
    description: 'Attribute values',
    type: [AttributeValueDto],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeValueDto)
  values: AttributeValueDto[];
}
