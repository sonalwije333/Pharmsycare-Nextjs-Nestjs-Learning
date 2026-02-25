import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetAttributeArgs {
  @ApiPropertyOptional({ description: 'Attribute ID', example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({ description: 'Attribute slug', example: 'size' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;
}
