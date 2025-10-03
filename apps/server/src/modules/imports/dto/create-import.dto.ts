import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ImportDto {
  @ApiProperty({ description: 'Shop ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  shop_id: number;

  @ApiPropertyOptional({ description: 'CSV data as base64 string', example: 'base64encodedcsvdata' })
  @IsOptional()
  @IsString()
  csv_data?: string;

  @ApiPropertyOptional({ description: 'File URL for CSV import', example: 'https://example.com/products.csv' })
  @IsOptional()
  @IsString()
  file_url?: string;
}

export class ImportResponseDto {
  @ApiProperty({ description: 'Import job ID', example: 'import-123' })
  job_id: string;

  @ApiProperty({ description: 'Import status', example: 'processing' })
  status: string;

  @ApiProperty({ description: 'Message', example: 'Import started successfully' })
  message: string;
}