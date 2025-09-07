import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateFaqDto {
    @ApiProperty({ description: 'FAQ title', example: 'How to reset password?' })
    @IsNotEmpty()
    @IsString()
    faq_title: string;

    @ApiProperty({ description: 'FAQ description', example: 'To reset your password, go to the login page and click "Forgot Password".' })
    @IsNotEmpty()
    @IsString()
    faq_description: string;

    @ApiPropertyOptional({ description: 'FAQ slug', example: 'how-to-reset-password' })
    @IsOptional()
    @IsString()
    slug?: string; // Add this property

    @ApiPropertyOptional({ description: 'FAQ type', example: 'general' })
    @IsOptional()
    @IsString()
    faq_type?: string;

    @ApiPropertyOptional({ description: 'Shop ID', example: 'shop-123' })
    @IsOptional()
    @IsString()
    shop_id?: string;

    @ApiPropertyOptional({ description: 'Issued by', example: 'admin' })
    @IsOptional()
    @IsString()
    issued_by?: string;

    @ApiPropertyOptional({ description: 'User ID', example: 'user-123' })
    @IsOptional()
    @IsString()
    user_id?: string;

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