// types/dto/create-type.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Banner, TypeSettings } from '../entities/type.entity';

export class CreateTypeDto {
  @ApiProperty({
    description: 'Type name',
    example: 'Grocery',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type image',
    type: () => Attachment,
    required: false
  })
  @IsObject()
  @IsOptional()
  image?: Attachment;

  @ApiProperty({
    description: 'Type icon',
    example: 'fa-apple',
    required: false
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: 'Banners for the type',
    type: [Banner],
    required: false
  })
  @IsArray()
  @IsOptional()
  banners?: Banner[];

  @ApiProperty({
    description: 'Promotional sliders',
    type: [Attachment],
    required: false
  })
  @IsArray()
  @IsOptional()
  promotional_sliders?: Attachment[];

  @ApiProperty({
    description: 'Type settings',
    type: () => TypeSettings,
    required: false
  })
  @IsObject()
  @IsOptional()
  settings?: TypeSettings;

  @ApiProperty({
    description: 'Language',
    example: 'en',
    default: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;
}