import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Attachment } from '../../common/entities/attachment.entity';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Fruits & Vegetables',
    type: String,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Category details',
    example: 'Fresh produce and vegetables',
    type: String,
  })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional({
    description: 'Category icon',
    example: 'fruits-vegetables',
    type: String,
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Language code',
    example: 'en',
    default: 'en',
    type: String,
  })
  @IsString()
  @IsOptional()
  language?: string = 'en';

  @ApiPropertyOptional({
    type: Attachment,
    required: false,
    description: 'Category image',
  })
  @IsObject()
  @IsOptional()
  image?: Attachment;

  @ApiPropertyOptional({
    description: 'Parent category ID',
    type: Number,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  parent?: number;

  @ApiProperty({
    description: 'Type ID',
    required: true,
    type: Number,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  type_id: number;
}