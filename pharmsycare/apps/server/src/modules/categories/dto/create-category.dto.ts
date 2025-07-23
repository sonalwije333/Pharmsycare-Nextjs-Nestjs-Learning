import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Category name', example: 'Baby Care' })
  name: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Category slug', example: 'baby-care' })
  slug: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Category icon', example: 'icon' })
  icon: string;

  // @IsNotEmpty()
  // @ApiProperty({ description: 'Type settings', example: 'settings' })
  // settings: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Category language', example: 'en' })
  language: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Category translated languages', example: '[en]' })
  translated_languages: string[];
}
