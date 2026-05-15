import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

class ManufacturerAttachmentDto {
  @ApiProperty({ required: true, example: 0, type: Number })
  @IsNumber()
  id: number;

  @ApiProperty({ required: true, example: '2026-05-15T18:59:29.737Z', type: String })
  @Type(() => Date)
  @IsDate()
  created_at: Date;

  @ApiProperty({ required: true, example: '2026-05-15T18:59:29.737Z', type: String })
  @Type(() => Date)
  @IsDate()
  updated_at: Date;

  @ApiProperty({ required: false, example: 'string', type: String })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ required: false, example: 'string', type: String })
  @IsOptional()
  @IsString()
  original?: string;
}

class ManufacturerSocialDto {
  @ApiProperty({ required: true, example: 'string', type: String })
  @IsString()
  icon: string;

  @ApiProperty({ required: true, example: 'string', type: String })
  @IsString()
  url: string;
}

export class CreateManufacturerDto {
  @ApiProperty({
    description: 'Shop ID',
    example: '1',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  shop_id?: string;

  @ApiProperty({
    description: 'Manufacturer name',
    example: 'Too cool publication',
    required: true,
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Manufacturer description',
    example: 'To publish is to make content available to the general public...',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Manufacturer website',
    example: 'https://redq.io/',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    description: 'Cover image',
    type: ManufacturerAttachmentDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ManufacturerAttachmentDto)
  cover_image?: ManufacturerAttachmentDto;

  @ApiProperty({
    description: 'Manufacturer image/logo',
    type: ManufacturerAttachmentDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ManufacturerAttachmentDto)
  image?: ManufacturerAttachmentDto;

  @ApiProperty({
    description: 'Social media links',
    type: ManufacturerSocialDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ManufacturerSocialDto)
  socials?: ManufacturerSocialDto;

  @ApiProperty({
    description: 'Is manufacturer approved',
    example: true,
    required: false,
    default: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean = false;

  @ApiProperty({
    description: 'Type ID (for future use)',
    example: 8,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  type_id?: number;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @ApiProperty({
    description: 'Translated languages',
    example: ['en'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  translated_languages?: string[] = ['en'];
}