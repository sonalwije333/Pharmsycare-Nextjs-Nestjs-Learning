// prescriptions/dto/get-prescriptions.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { PrescriptionStatus } from '../entities/prescription.entity';
import { Prescription } from '../entities/prescription.entity';

export class GetPrescriptionsDto extends PaginationArgs {
  @ApiProperty({ description: 'Search by customer name or ID', example: 'John', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by shop ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shop_id?: number;

  @ApiProperty({ description: 'Filter by status', enum: PrescriptionStatus, required: false })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @ApiProperty({ description: 'Filter by customer ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  customer_id?: number;

  @ApiProperty({ description: 'Sort by field', example: 'created_at', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order (asc or desc)', example: 'desc', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class PrescriptionPaginator {
  data: Prescription[];
  paging: {
    total: number;
    limit: number;
    page: number;
  };
}
