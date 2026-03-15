import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsUUID,
} from 'class-validator';

export class AttachmentDto {
  @ApiProperty({
    description: 'Attachment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  id: string;

  @ApiPropertyOptional({
    description: 'Attachment URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Attachment thumbnail',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnail?: string;
}

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Baby Care' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Category slug', example: 'baby-care' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Category details',
    example: 'All baby care products',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({
    description: 'Category type ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  type_id?: string;

  @ApiPropertyOptional({ description: 'Category icon', example: 'baby-icon' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Category language',
    example: 'en',
    default: 'en',
  })
  @IsNotEmpty()
  @IsString()
  language: string;

  @ApiPropertyOptional({ description: 'Category image', type: AttachmentDto })
  @IsOptional()
  image?: AttachmentDto;

  @ApiPropertyOptional({ description: 'Banner images', type: [AttachmentDto] })
  @IsOptional()
  @IsArray()
  banners?: AttachmentDto[];

  @ApiPropertyOptional({
    description: 'Promotional sliders',
    type: [AttachmentDto],
  })
  @IsOptional()
  @IsArray()
  promotional_sliders?: AttachmentDto[];

  @ApiPropertyOptional({
    description: 'Translated languages',
    example: ['en', 'es'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  translated_languages?: string[];
}
