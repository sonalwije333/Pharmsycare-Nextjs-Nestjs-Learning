import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsObject, IsArray } from 'class-validator';

class AttachmentPayloadDto {
  @ApiPropertyOptional({ description: 'Attachment ID', example: '1' })
  @IsOptional()
  id?: string | number;

  @ApiPropertyOptional({ description: 'Attachment thumbnail URL', example: '/uploads/banner-thumb-1.jpg' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ description: 'Attachment original URL', example: '/uploads/banner-1.jpg' })
  @IsOptional()
  @IsString()
  original?: string;
}

class BannerDto {
  @ApiPropertyOptional({ description: 'Banner ID', example: 1 })
  @IsOptional()
  id?: number | string;

  @ApiProperty({ description: 'Banner title', example: 'Summer Sale' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Banner description', example: 'Get 20% off on all medicines' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Banner image payload',
    example: {
      id: '1',
      thumbnail: '/uploads/banner-thumb-1.jpg',
      original: '/uploads/banner-1.jpg',
    },
  })
  @IsNotEmpty()
  image: string | AttachmentPayloadDto;
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
  banners?: BannerDto[];

  @ApiPropertyOptional({
    description: 'Promotional sliders',
    type: [AttachmentPayloadDto],
    example: [
      {
        id: '1',
        thumbnail: '/uploads/slider-thumb-1.jpg',
        original: '/uploads/slider-1.jpg',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  promotional_sliders?: AttachmentPayloadDto[];

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
    type: Object,
    example: {
      isHome: true,
      productCard: 'grid',
      layoutType: 'classic',
      bestSelling: {
        enable: true,
        title: 'Best Selling Products',
      },
    }
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}