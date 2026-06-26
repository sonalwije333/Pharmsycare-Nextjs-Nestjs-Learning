import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionMedicineDto {
  @ApiProperty({ description: 'Product ID', example: 1049 })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'Product name', example: 'The Recover Capsules' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Quantity', example: 1 })
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: 'Unit price', example: 1850 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Product image url' })
  @IsOptional()
  @IsString()
  image?: string;
}

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Attachment ID from upload', example: 'upload_123' })
  @IsString()
  @IsNotEmpty()
  attachment_id: string;

  @ApiPropertyOptional({ description: 'Customer notes', example: 'Please call before delivery' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Medicines included with this prescription',
    type: [PrescriptionMedicineDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionMedicineDto)
  medicines?: PrescriptionMedicineDto[];
}
