// prescriptions/dto/approve-prescription.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApprovePrescriptionDto {
  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsString()
  @IsOptional()
  admin_notes?: string;
}

