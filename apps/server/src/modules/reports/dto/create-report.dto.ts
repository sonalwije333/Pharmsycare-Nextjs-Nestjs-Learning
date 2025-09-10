import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';

export class CreateReportDto {
    @ApiProperty({ description: 'Report message', example: 'I found an issue with the checkout process' })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiPropertyOptional({ description: 'Report title', example: 'Checkout Issue' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({
        description: 'Report type',
        enum: ['bug', 'feature', 'complaint', 'suggestion', 'other'],
        example: 'bug'
    })
    @IsOptional()
    @IsEnum(['bug', 'feature', 'complaint', 'suggestion', 'other'])
    type?: string;

    @ApiProperty({ description: 'User ID', example: 'user-123' })
    @IsNotEmpty()
    @IsString()
    user_id: string;

    @ApiPropertyOptional({ description: 'User email', example: 'user@example.com' })
    @IsOptional()
    @IsString()
    user_email?: string;

    @ApiPropertyOptional({
        description: 'Priority',
        enum: ['low', 'medium', 'high', 'critical'],
        example: 'medium'
    })
    @IsOptional()
    @IsEnum(['low', 'medium', 'high', 'critical'])
    priority?: string;

    @ApiPropertyOptional({ description: 'Metadata', type: Object })
    @IsOptional()
    metadata?: any;

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