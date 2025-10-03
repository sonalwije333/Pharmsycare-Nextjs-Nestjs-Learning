import { PickType } from '@nestjs/swagger';
import { Attribute } from '../entities/attribute.entity';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AttributeValueDto {
  @ApiProperty({ description: 'Attribute value' })
  value: string;

  @ApiProperty({ description: 'Meta information', required: false })
  meta?: string;

  @ApiProperty({ description: 'Language', required: false, default: 'en' })
  language?: string;
}

export class CreateAttributeDto extends PickType(Attribute, [
  'name',
  'shop_id',
  'language',
  'translated_languages',
]) {
  @ApiProperty({ type: [AttributeValueDto], description: 'Attribute values' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeValueDto)
  values: AttributeValueDto[];
}