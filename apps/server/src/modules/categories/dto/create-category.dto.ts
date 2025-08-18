import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Category name', example: 'Baby Care' })
  name: string;

  @IsOptional()
  @ApiProperty({ description: 'Category slug', example: 'baby-care' })
  slug: string;

  @IsOptional()
  @ApiProperty({ description: 'Type image' })
  image: object;

  @IsOptional()
  @ApiProperty({ description: 'Category details ' })
  details : string;

  @IsOptional()
  @ApiProperty({ description: 'Category details ' })
  parent : string;

  @IsOptional()
  @ApiProperty({ description: 'Category Type id ' })
  type_id : string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Category icon', example: 'icon' })
  icon: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Category language', example: 'en' })
  language: string;

  @IsOptional()
  @ApiProperty({ description: 'Category translated languages', example: '[en]' })
  translated_languages: string[];
}
