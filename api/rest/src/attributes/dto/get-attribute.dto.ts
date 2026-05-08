import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAttributeArgs {
  @ApiProperty({ description: 'Attribute ID', example: 1, required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Attribute slug', example: 'color', required: false, type: String })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Language code', example: 'en', required: false, default: 'en', type: String })
  @IsOptional()
  @IsString()
  language?: string = 'en';
}