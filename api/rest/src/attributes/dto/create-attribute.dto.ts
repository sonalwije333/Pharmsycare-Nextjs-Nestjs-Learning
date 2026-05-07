import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttributeValueDto {
  @ApiProperty({ description: 'Attribute value ID', example: 1, required: false, type: Number })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ description: 'Attribute value', example: 'Red', required: true, type: String })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'Meta information (e.g., color code)', example: '#FF0000', required: false, type: String })
  @IsString()
  @IsOptional()
  meta?: string;

  @ApiProperty({ description: 'Language code', example: 'en', required: false, default: 'en', type: String })
  @IsString()
  @IsOptional()
  language?: string = 'en';
}

export class CreateAttributeDto {
  @ApiProperty({ description: 'Attribute name', example: 'Color', type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Shop ID', example: '1', type: String })
  @IsString()
  @IsNotEmpty()
  shop_id: string;

  @ApiProperty({ description: 'Language code', example: 'en', required: false, default: 'en', type: String })
  @IsString()
  @IsOptional()
  language?: string = 'en';

  @ApiProperty({ description: 'Attribute values', type: () => [AttributeValueDto], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttributeValueDto)
  values: AttributeValueDto[];
}