import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FlashSaleType } from 'src/common/enums/flash-sale.enum';

class AttachmentDto {
  @ApiProperty({ required: false, type: Number, example: 0 })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ required: false, type: String, example: '2026-05-10T15:40:55.818Z' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ required: false, type: String, example: '2026-05-10T15:40:55.818Z' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({ required: false, type: String, example: 'string' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ required: false, type: String, example: 'string' })
  @IsString()
  @IsOptional()
  original?: string;
}


export class CreateFlashSaleDto {
  @ApiProperty({
    description: 'Flash sale title',
    example: 'Limited-Time Offer: Act Fast!',
    type: String,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Flash sale description',
    example: "Don't miss out on our incredible...",
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Start date', 
    example: '2023-10-31 06:49:59',
    type: String,
  })
  @IsString()
  start_date: string;

  @ApiProperty({ 
    description: 'End date', 
    example: '2024-11-29 18:00:00',
    type: String,
  })
  @IsString()
  end_date: string;

  @ApiProperty({ 
    description: 'Flash sale type', 
    enum: FlashSaleType,
    example: FlashSaleType.PERCENTAGE,
  })
  @IsEnum(FlashSaleType)
  type: FlashSaleType;

  @ApiProperty({ 
    description: 'Discount rate', 
    example: '50',
    type: String,
  })
  @IsString()
  rate: string;

  @ApiProperty({
    type: AttachmentDto,
    description: 'Flash sale image',
    required: false,
  })
  @ValidateNested()
  @Type(() => AttachmentDto)
  @IsOptional()
  image?: AttachmentDto;

  @ApiProperty({
    type: AttachmentDto,
    description: 'Cover image',
    required: false,
  })
  @ValidateNested()
  @Type(() => AttachmentDto)
  @IsOptional()
  cover_image?: AttachmentDto;

  @ApiProperty({ 
    description: 'Sale builder configuration', 
    required: false,
    type: Object,
  })
  @IsObject()
  @IsOptional()
  sale_builder?: any;

  @ApiProperty({ 
    description: 'Product IDs', 
    type: [Number], 
    required: false,
    example: [951, 952],
  })
  @IsArray()
  @IsOptional()
  product_ids?: number[];

  @ApiProperty({ 
    description: 'Language code', 
    default: 'en',
    type: String,
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string = 'en';
}