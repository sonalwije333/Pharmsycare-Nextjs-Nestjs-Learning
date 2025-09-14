import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateTypeDto {
    @IsNotEmpty()
    @ApiProperty({ description: 'Type name', example: 'Medicine' })
    name: string;

    @IsOptional()
    @ApiProperty({ description: 'Type slug', example: 'medicine' })
    slug: string;

    @IsNotEmpty()
    @ApiProperty({ description: 'Type icon', example: 'icon' })
    icon: string;

    @IsOptional()
    @ApiProperty({ description: 'Type banners' })
    banners: object[];

    @IsNotEmpty()
    @ApiProperty({ description: 'Type language', example: 'en' })
    language: string;

    @IsOptional()
    @ApiProperty({ description: 'Type translated languages', example: '[en]' })
    translated_languages: string[];

    @IsOptional()
    @IsObject()
    settings?: {
        isHome?: boolean;
        productCard?: string;
        [key: string]: any;
    };
}