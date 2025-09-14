import { PickType } from '@nestjs/swagger';
import { TermsAndConditions } from '../entities/terms-and-conditions.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTermsAndConditionsDto extends PickType(TermsAndConditions, [
    'title',
    'description',
]) {
    @ApiPropertyOptional({ description: 'Terms slug', example: 'privacy-policy' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ description: 'User ID', example: 'user-123' })
    @IsNotEmpty()
    @IsString()
    user_id: string;

    @ApiPropertyOptional({ description: 'Shop ID', example: 'shop-456' })
    @IsOptional()
    @IsString()
    shop_id?: string;

    @ApiPropertyOptional({ description: 'Terms type', example: 'privacy' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ description: 'Issued by', example: 'Company Name' })
    @IsOptional()
    @IsString()
    issued_by?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en', default: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Translated languages', example: ['en', 'es'] })
    @IsOptional()
    translated_languages?: string[];

    @ApiPropertyOptional({ description: 'Is approved', example: false, default: false })
    @IsOptional()
    @IsBoolean()
    is_approved?: boolean;
}