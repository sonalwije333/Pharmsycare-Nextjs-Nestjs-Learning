import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BannerDto {
  @ApiProperty({ description: 'Banner ID', example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ description: 'Banner title', example: 'Summer Sale' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Banner description', example: 'Get 20% off on all medicines' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Banner image URL', example: '/uploads/banner-1.jpg' })
  @IsNotEmpty()
  @IsString()
  image: string;
}

class TypeSettingsDto {
  @ApiPropertyOptional({ description: 'Show on homepage', example: true })
  @IsOptional()
  isHome?: boolean;

  @ApiPropertyOptional({ description: 'Product card layout', example: 'grid' })
  @IsOptional()
  @IsString()
  productCard?: string;

  @ApiPropertyOptional({ description: 'Layout type', example: 'classic' })
  @IsOptional()
  @IsString()
  layoutType?: string;

  // Allow additional dynamic properties
  [key: string]: any;
}

export class CreateTypeDto {
  @ApiProperty({
    description: 'Type name',
    example: 'Medicine',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Type slug',
    example: 'medicine',
    required: false
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: 'Type icon',
    example: 'icon-medicine',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  icon: string;

  @ApiPropertyOptional({
    description: 'Type banners',
    type: [BannerDto],
    example: [
      {
        id: 1,
        title: 'Summer Sale',
        description: 'Get 20% off on all medicines',
        image: '/uploads/banner-1.jpg'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerDto)
  banners?: BannerDto[];

  @ApiProperty({
    description: 'Type language',
    example: 'en',
    default: 'en',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  language: string;

  @ApiPropertyOptional({
    description: 'Translated languages',
    example: ['en', 'es', 'fr'],
    default: ['en']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  translated_languages?: string[];

  @ApiPropertyOptional({
    description: 'Type settings',
    type: TypeSettingsDto,
    example: {
      isHome: true,
      productCard: 'grid',
      layoutType: 'classic'
    }
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TypeSettingsDto)
  settings?: TypeSettingsDto;
}