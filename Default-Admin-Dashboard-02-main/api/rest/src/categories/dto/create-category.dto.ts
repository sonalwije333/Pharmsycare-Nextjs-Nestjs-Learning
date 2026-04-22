// categories/dto/create-category.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Attachment } from '../../common/entities/attachment.entity';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Fruits & Vegetables' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Category details', required: false })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({ description: 'Category icon', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Language code', default: 'en', required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ type: Attachment, required: false })
  @IsOptional()
  @IsObject()
  image?: Attachment;

  @ApiProperty({ description: 'Parent category ID', required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  parent?: number;

  @ApiProperty({ description: 'Type ID', required: true })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  type_id: number;
}
