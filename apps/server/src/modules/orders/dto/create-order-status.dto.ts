import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateOrderStatusDto {
  @ApiProperty({ description: 'Status name', example: 'Processing' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Status color', example: '#FFA500' })
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty({ description: 'Sort order', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  serial: number;

  @ApiProperty({ description: 'Status slug', example: 'processing' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Language',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Translated languages',
    example: ['en', 'es'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  translated_languages?: string[];
}

export class UpdateOrderStatusDto extends PartialType(CreateOrderStatusDto) {}
