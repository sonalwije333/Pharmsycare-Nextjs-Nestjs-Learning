import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber, IsObject } from 'class-validator';
import {Attachment} from "../../common/entities/attachment.entity";
import {ShopSocials} from "../../settings/entities/setting.entity";

export class CreateAuthorDto {
    @ApiProperty({ description: 'Author name', example: 'John Doe' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Author bio', example: 'Renowned author with multiple bestsellers' })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({ description: 'Birth date', example: '1980-01-01' })
    @IsOptional()
    @IsString()
    born?: string;

    @ApiPropertyOptional({ description: 'Death date', example: '2020-01-01' })
    @IsOptional()
    @IsString()
    death?: string;

    @ApiPropertyOptional({ description: 'Author quote', example: 'Writing is my passion' })
    @IsOptional()
    @IsString()
    quote?: string;

    @ApiPropertyOptional({ description: 'Author slug', example: 'john-doe' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ description: 'Languages', example: 'English, Spanish' })
    @IsOptional()
    @IsString()
    languages?: string;

    @ApiPropertyOptional({ description: 'Is approved', example: true, default: false })
    @IsOptional()
    @IsBoolean()
    is_approved?: boolean;

    @ApiPropertyOptional({ description: 'Shop ID', example: 'shop-123' })
    @IsOptional()
    @IsString()
    shop_id?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en', default: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Translated languages', example: ['en', 'es'] })
    @IsOptional()
    @IsString({ each: true })
    translated_languages?: string[];

    @ApiPropertyOptional({ description: 'Cover image', type: Attachment })
    @IsOptional()
    @IsObject()
    cover_image?: Attachment;

    @ApiPropertyOptional({ description: 'Profile image', type: Attachment })
    @IsOptional()
    @IsObject()
    image?: Attachment;

    @ApiPropertyOptional({ description: 'Social media links', type: Object })
    @IsOptional()
    @IsObject()
    socials?: ShopSocials;
}