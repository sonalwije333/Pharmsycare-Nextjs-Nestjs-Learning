import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, IsBoolean, IsObject } from 'class-validator';
import { Attachment } from "../../common/entities/attachment.entity";
import { Product } from "../../products/entities/product.entity";

export class CreateFlashSaleDto {
    @ApiProperty({ description: 'Flash sale title', example: 'Summer Sale' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Flash sale description', example: 'Big summer sale with huge discounts' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Start date', example: '2023-06-01T00:00:00.000Z' })
    @IsNotEmpty()
    @IsString()
    start_date: string;

    @ApiProperty({ description: 'End date', example: '2023-06-30T23:59:59.000Z' })
    @IsNotEmpty()
    @IsString()
    end_date: string;

    @ApiProperty({ description: 'Flash sale type', example: 'percentage' })
    @IsNotEmpty()
    @IsString()
    type: string;

    @ApiProperty({ description: 'Sale builder configuration', example: { discount: 20 } })
    @IsNotEmpty()
    @IsObject()
    sale_builder: any;

    @ApiProperty({ description: 'Products included in flash sale', type: [Product] })
    @IsNotEmpty()
    @IsArray()
    products: Product[];

    @ApiPropertyOptional({ description: 'Flash sale image', type: Attachment })
    @IsOptional()
    @IsObject()
    image?: Attachment;

    @ApiPropertyOptional({ description: 'Cover image', type: Attachment })
    @IsOptional()
    @IsObject()
    cover_image?: Attachment;

    @ApiPropertyOptional({ description: 'Rate', example: '20%' })
    @IsOptional()
    @IsString()
    rate?: string;

    @ApiPropertyOptional({ description: 'Sale status', example: true, default: false })
    @IsOptional()
    @IsBoolean()
    sale_status?: boolean;

    @ApiPropertyOptional({ description: 'Language', example: 'en', default: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Translated languages', example: ['en', 'es'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    translated_languages?: string[];

    @ApiPropertyOptional({ description: 'Slug', example: 'summer-sale' })
    @IsOptional()
    @IsString()
    slug?: string;
}