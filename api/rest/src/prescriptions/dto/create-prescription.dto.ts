// prescriptions/dto/create-prescription.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsOptional, IsDate } from 'class-validator';
import { PrescriptionStatus } from '../entities/prescription.entity';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Customer ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  customer_id: number;

  @ApiProperty({ description: 'Shop ID', example: 1 })
  @IsNotEmpty()
  @IsInt()
  shop_id: number;

  @ApiProperty({ description: 'Prescription file URL', example: 'https://example.com/prescription.pdf' })
  @IsNotEmpty()
  @IsString()
  prescription_file: string;

  @ApiProperty({ description: 'Doctor name', example: 'Dr. John Doe', required: false })
  @IsOptional()
  @IsString()
  doctor_name?: string;

  @ApiProperty({ description: 'Hospital name', example: 'City Hospital', required: false })
  @IsOptional()
  @IsString()
  hospital_name?: string;

  @ApiProperty({ description: 'Prescription date', example: '2024-01-15', required: false })
  @IsOptional()
  prescription_date?: Date;

  @ApiProperty({ description: 'Expiry date', example: '2024-03-15', required: false })
  @IsOptional()
  expiry_date?: Date;

  @ApiProperty({ description: 'Customer notes', example: 'Urgent prescription', required: false })
  @IsOptional()
  @IsString()
  customer_notes?: string;
}
