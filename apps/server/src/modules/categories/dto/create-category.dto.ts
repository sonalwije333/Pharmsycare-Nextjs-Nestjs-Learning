// src/modules/categories/dto/create-category.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { Attachment } from '../../common/entities/attachment.entity';

export class CreateCategoryDto {
    @ApiProperty({ description: 'Category name', example: 'Baby Care' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Category slug', example: 'baby-care' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ description: 'Category details', example: 'All baby care products' })
    @IsOptional()
    @IsString()
    details?: string;

    @ApiPropertyOptional({ description: 'Parent category ID', example: 'parent-category-id' })
    @IsOptional()
    @IsString()
    parent_id?: string;

    @ApiPropertyOptional({ description: 'Category type ID', example: 'type-id' })
    @IsOptional()
    @IsString()
    type_id?: string;

    @ApiPropertyOptional({ description: 'Category icon', example: 'icon-name' })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({ description: 'Category language', example: 'en', default: 'en' })
    @IsNotEmpty()
    @IsString()
    language: string;

    @ApiPropertyOptional({ description: 'Category image', type: Attachment })
    @IsOptional()
    image?: Attachment;

    @ApiPropertyOptional({ description: 'Banner images', type: [Attachment] })
    @IsOptional()
    banners?: Attachment[];

    @ApiPropertyOptional({ description: 'Promotional sliders', type: [Attachment] })
    @IsOptional()
    promotional_sliders?: Attachment[];

    @ApiPropertyOptional({ description: 'Translated languages', example: ['en', 'es'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    translated_languages?: string[];
}