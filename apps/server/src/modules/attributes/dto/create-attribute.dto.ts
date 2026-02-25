import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttributeValueDto {
  @ApiProperty({ description: 'Attribute value', example: 'Small' })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: 'Meta information', example: '#FF0000' })
  @IsOptional()
  @IsString()
  meta?: string;

  @ApiPropertyOptional({
    description: 'Language',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;
}

export class CreateAttributeDto {
  @ApiProperty({ description: 'Attribute name', example: 'Size' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Attribute slug', example: 'size' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Shop ID', example: 1 })
  @IsOptional()
  @IsString()
  shop_id?: string;

  @ApiPropertyOptional({
    description: 'Language',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Translated languages',
    example: ['en', 'es'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  translated_languages?: string[];

  @ApiProperty({
    type: [AttributeValueDto],
    description: 'Attribute values',
    example: [{ value: 'Small' }, { value: 'Medium' }, { value: 'Large' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeValueDto)
  values: AttributeValueDto[];
}
