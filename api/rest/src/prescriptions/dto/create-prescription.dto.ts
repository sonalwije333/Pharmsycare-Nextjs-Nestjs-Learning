import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Attachment ID from upload', example: 'upload_123' })
  @IsString()
  @IsNotEmpty()
  attachment_id: string;

  @ApiPropertyOptional({ description: 'Customer notes', example: 'Please call before delivery' })
  @IsString()
  @IsOptional()
  notes?: string;
}