import { PickType } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order-status.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateOrderStatusDto extends PickType(OrderStatus, [
  'name',
  'color',
  'serial',
  'slug',
  'language',
] as const) {
  @ApiProperty({ description: 'Status name', example: 'Processing' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Status color', example: '#FFA500' })
  @IsString()
  color: string;

  @ApiProperty({ description: 'Sort order', example: 2 })
  @IsNumber()
  serial: number;

  @ApiProperty({ description: 'Status slug', example: 'processing' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Language', example: 'en', default: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Translated languages', example: ['en', 'es'] })
  @IsOptional()
  @IsArray()
  translated_languages?: string[];
}

export class UpdateOrderStatusDto extends PartialType(CreateOrderStatusDto) {}