// src/modules/shops/dto/create-shop.dto.ts
import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShopDto {
    @ApiProperty({ description: 'Shop name' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Shop slug' })
    @IsString()
    slug: string;

    @ApiPropertyOptional({ description: 'Shop description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Shop address' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Cover image URL' })
    @IsOptional()
    @IsString()
    cover_image?: string;

    @ApiPropertyOptional({ description: 'Logo URL' })
    @IsOptional()
    @IsString()
    logo?: string;

    @ApiPropertyOptional({ description: 'Shop balance', default: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    balance?: number;

    @ApiPropertyOptional({ description: 'Shop settings' })
    @IsOptional()
    settings?: Record<string, any>;

    @ApiProperty({ type: [Number], description: 'Category IDs' })
    @IsArray()
    @IsNumber({}, { each: true })
    categories: number[];
}