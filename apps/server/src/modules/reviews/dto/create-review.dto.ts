import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsString, IsArray } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ description: 'Rating (1-5)', example: 5 })
    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @ApiProperty({ description: 'Comment', example: 'Excellent product!' })
    @IsNotEmpty()
    @IsString()
    comment: string;

    @ApiPropertyOptional({ description: 'Review photos', type: [Object] })
    @IsOptional()
    @IsArray()
    photos?: any[];

    @ApiProperty({ description: 'Product ID', example: '123' }) // Change to number example
    @IsNotEmpty()
    @IsString() // Keep as string if frontend sends string, but convert to number in service
    product_id: string;

    @ApiProperty({ description: 'Shop ID', example: '456' }) // Change to number example
    @IsNotEmpty()
    @IsString() // Keep as string if frontend sends string, but convert to number in service
    shop_id: string;

    @ApiProperty({ description: 'User ID', example: '789' }) // Change to number example
    @IsNotEmpty()
    @IsString() // Keep as string if frontend sends string, but convert to number in service
    user_id: string;

    @ApiPropertyOptional({ description: 'Variation option ID', example: 1 })
    @IsOptional()
    @IsNumber()
    variation_option_id?: number;

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