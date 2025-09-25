import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ProductStatus, ProductType } from 'src/common/enums/enums';

export class CreateProductDto {
    @ApiProperty({ description: 'Product name', example: 'Baby Care' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Product slug', example: 'baby-care' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ description: 'Product image' })
    @IsOptional()
    image?: any;

    @ApiPropertyOptional({ description: 'Product gallery' })
    @IsOptional()
    gallery?: any;

    @ApiPropertyOptional({ description: 'Product description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Product type ID', example: 1 })
    @IsNotEmpty()
    @IsNumber()
    type_id: number;

    @ApiPropertyOptional({ description: 'Shop ID', example: 1 })
    @IsOptional()
    @IsNumber()
    shop_id?: number;

    @ApiProperty({ description: 'Product price', example: 29.99 })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiPropertyOptional({ description: 'Product sale price', example: 24.99 })
    @IsOptional()
    @IsNumber()
    sale_price?: number;

    @ApiPropertyOptional({ description: 'Product min price', example: 19.99 })
    @IsOptional()
    @IsNumber()
    min_price?: number;

    @ApiPropertyOptional({ description: 'Product max price', example: 39.99 })
    @IsOptional()
    @IsNumber()
    max_price?: number;

    @ApiPropertyOptional({ description: 'Product SKU', example: 'SKU-12345' })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiPropertyOptional({ description: 'Product quantity', example: 100, default: 0 })
    @IsOptional()
    @IsNumber()
    quantity?: number;

    @ApiPropertyOptional({ description: 'Product in stock', example: true, default: true })
    @IsOptional()
    @IsBoolean()
    in_stock?: boolean;

    @ApiPropertyOptional({ description: 'Is taxable', example: true, default: true })
    @IsOptional()
    @IsBoolean()
    is_taxable?: boolean;

    @ApiPropertyOptional({ description: 'Shipping class ID', example: 1 })
    @IsOptional()
    @IsNumber()
    shipping_class_id?: number;

    @ApiPropertyOptional({ description: 'Product status', enum: ProductStatus, default: ProductStatus.DRAFT })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @ApiPropertyOptional({ description: 'Product type', enum: ProductType, default: ProductType.SIMPLE })
    @IsOptional()
    @IsEnum(ProductType)
    product_type?: ProductType;

    @ApiPropertyOptional({ description: 'Product unit', example: 'piece' })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en', default: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Translated languages', example: ['en', 'es'] })
    @IsOptional()
    translated_languages?: string[];

    @ApiPropertyOptional({ description: 'Product height', example: 10.5 })
    @IsOptional()
    @IsNumber()
    height?: number;

    @ApiPropertyOptional({ description: 'Product width', example: 15.2 })
    @IsOptional()
    @IsNumber()
    width?: number;

    @ApiPropertyOptional({ description: 'Product length', example: 20.1 })
    @IsOptional()
    @IsNumber()
    length?: number;

    @ApiPropertyOptional({ description: 'Tag IDs', example: [1, 2] })
    @IsOptional()
    tag_ids?: number[];
}