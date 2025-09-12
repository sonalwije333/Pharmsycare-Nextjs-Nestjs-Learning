import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsString, IsArray } from 'class-validator';

export class CreateReportDto {
    @ApiProperty({ description: 'Model ID', example: 123 })
    @IsNotEmpty()
    @IsNumber()
    model_id: number;

    @ApiProperty({ description: 'Model type', example: 'review' })
    @IsNotEmpty()
    @IsString()
    model_type: string;

    @ApiProperty({ description: 'Report message', example: 'This content contains inappropriate material' })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiPropertyOptional({ description: 'User ID', example: 1 })
    @IsOptional()
    @IsNumber()
    user_id?: number;

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