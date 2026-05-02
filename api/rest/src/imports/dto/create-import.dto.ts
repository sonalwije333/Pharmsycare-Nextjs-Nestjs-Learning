// imports/dto/create-import.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum ImportType {
  ATTRIBUTES = 'attributes',
  PRODUCTS = 'products',
  VARIATION_OPTIONS = 'variation-options',
}

export class ImportDto {
  @ApiProperty({
    description: 'Shop ID to import data to',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  shop_id: number;
}

// Define ImportHistoryItem before using it
export class ImportHistoryItem {
  @ApiProperty({
    description: 'Import ID',
    example: 'imp_1234567890'
  })
  id: string;

  @ApiProperty({
    description: 'Import type',
    enum: ImportType,
    example: ImportType.PRODUCTS
  })
  type: ImportType;

  @ApiProperty({
    description: 'Shop ID',
    example: 1
  })
  shop_id: number;

  @ApiProperty({
    description: 'User ID who initiated import',
    example: 10
  })
  user_id: number;

  @ApiProperty({
    description: 'Import status',
    enum: ['pending', 'processing', 'completed', 'failed'],
    example: 'completed'
  })
  status: string;

  @ApiProperty({
    description: 'Total records',
    example: 150
  })
  total_records: number;

  @ApiProperty({
    description: 'Processed records',
    example: 145
  })
  processed_records: number;

  @ApiProperty({
    description: 'Failed records',
    example: 5
  })
  failed_records: number;

  @ApiProperty({
    description: 'File name',
    example: 'products_import.csv'
  })
  file_name: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Completion timestamp',
    example: '2024-01-01T00:01:30.000Z',
    required: false
  })
  completed_at?: Date;
}

export class ImportResponse {
  @ApiProperty({
    description: 'Import operation status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Import completed successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Import job ID for tracking',
    example: 'imp_1234567890',
    required: false
  })
  import_id?: string;
}

export class ImportStatusResponse {
  @ApiProperty({
    description: 'Import job ID',
    example: 'imp_1234567890'
  })
  import_id: string;

  @ApiProperty({
    description: 'Import status',
    enum: ['pending', 'processing', 'completed', 'failed'],
    example: 'completed'
  })
  status: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Import completed successfully'
  })
  message: string;
}

export class ImportHistoryResponse {
  @ApiProperty({
    description: 'Import history records',
    type: [ImportHistoryItem]
  })
  data: ImportHistoryItem[];

  @ApiProperty({
    description: 'Total count',
    example: 50
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10
  })
  limit: number;
}