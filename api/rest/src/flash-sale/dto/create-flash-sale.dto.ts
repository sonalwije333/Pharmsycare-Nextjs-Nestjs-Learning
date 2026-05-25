// flash-sale/dto/create-flash-sale.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FlashSale } from '../entities/flash-sale.entity';
import { Attachment } from '../../common/entities/attachment.entity';

export class CreateFlashSaleDto {
  @ApiProperty({
    description: 'Flash sale title',
    example: 'Limited-Time Offer: Act Fast!',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Flash sale description',
    example: "Don't miss out on our incredible...",
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Start date', example: '2023-10-31 06:49:59' })
  @IsString()
  start_date: string;

  @ApiProperty({ description: 'End date', example: '2024-11-29 18:00:00' })
  @IsString()
  end_date: string;

  @ApiProperty({ description: 'Flash sale type', example: 'percentage' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Discount rate', example: '50' })
  @Type(() => String)
  @IsString()
  rate: string;

  @ApiProperty({ description: 'Sale status', required: false, default: true })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  sale_status?: boolean;

  @ApiProperty({
    type: Attachment,
    description: 'Flash sale image',
    required: false,
  })
  @ValidateNested()
  @Type(() => Attachment)
  @IsOptional()
  image?: Attachment;

  @ApiProperty({
    type: Attachment,
    description: 'Cover image',
    required: false,
  })
  @ValidateNested()
  @Type(() => Attachment)
  @IsOptional()
  cover_image?: Attachment;

  @ApiProperty({ description: 'Sale builder configuration', required: false })
  @IsObject()
  @IsOptional()
  sale_builder?: any;

  @ApiProperty({ description: 'Product IDs', type: [Number], required: false })
  @IsArray()
  @IsOptional()
  product_ids?: number[];

  @ApiProperty({ description: 'Language code', default: 'en' })
  @IsString()
  @IsOptional()
  language?: string;
}
