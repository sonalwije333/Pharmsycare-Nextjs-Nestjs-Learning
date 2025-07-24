import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTypeDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Type name', example: 'Medicine' })
  name: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Type slug', example: 'medicine' })
  slug: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Type icon', example: 'icon' })
  icon: string;

  // @IsNotEmpty()
  // @ApiProperty({ description: 'Type settings', example: 'settings' })
  // settings: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Type language', example: 'en' })
  language: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Type translated languages', example: '[en]' })
  translated_languages: string[];
}
