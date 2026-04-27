// prescriptions/dto/update-prescription.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsOptional, IsEnum, IsString, IsInt } from 'class-validator';
import { PrescriptionStatus } from '../entities/prescription.entity';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @ApiProperty({ description: 'Prescription status', enum: PrescriptionStatus, required: false })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @ApiProperty({ description: 'Admin notes', example: 'Prescription verified', required: false })
  @IsOptional()
  @IsString()
  admin_notes?: string;

  @ApiProperty({ description: 'Approved by (staff ID)', example: 1, required: false })
  @IsOptional()
  @IsInt()
  approved_by?: number;
}
