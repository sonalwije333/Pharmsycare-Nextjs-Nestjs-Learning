import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsObject, IsArray } from 'class-validator';
import {Attachment} from "../../common/entities/attachment.entity";

export class CreateTagDto {
    @ApiProperty({ description: 'Tag name', example: 'Electronics' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Tag slug', example: 'electronics' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ description: 'Parent tag ID', example: 1 })
    @IsOptional()
    @IsNumber()
    parent?: number;

    @ApiPropertyOptional({ description: 'Tag details', example: 'Electronic products category' })
    @IsOptional()
    @IsString()
    details?: string;

    @ApiPropertyOptional({ description: 'Tag image', type: Attachment })
    @IsOptional()
    @IsObject()
    image?: Attachment;

    @ApiPropertyOptional({ description: 'Tag icon', example: 'icon-electronics' })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiPropertyOptional({ description: 'Tag type ID', example: 1 })
    @IsOptional()
    @IsNumber()
    type?: number;

    @ApiPropertyOptional({ description: 'Language', example: 'en', default: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Translated languages', example: ['en', 'es'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    translated_languages?: string[];
}