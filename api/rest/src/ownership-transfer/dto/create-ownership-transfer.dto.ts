// ownership-transfer/dto/create-ownership-transfer.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { OwnershipTransfer } from '../entities/ownership-transfer.entity';

export enum OwnershipTransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export class CreateOwnershipTransferDto {
  @ApiProperty({
    description: 'Transfer status',
    enum: OwnershipTransferStatus,
    required: false,
    default: 'pending'
  })
  @IsOptional()
  @IsEnum(OwnershipTransferStatus)
  status?: string;
  @ApiProperty({
    description: 'Transaction identifier',
    example: '2024-08-03-0001',
    required: false
  })
  @IsOptional()
  @IsString()
  transaction_identifier?: string;

  @ApiProperty({
    description: 'Previous owner ID',
    example: 48,
    required: false
  })
  @IsOptional()
  previous_owner_id?: number;

  @ApiProperty({
    description: 'Current owner ID',
    example: 49,
    required: false
  })
  @IsOptional()
  current_owner_id?: number;

  @ApiProperty({
    description: 'Transfer message',
    example: 'Transferring shop ownership',
    required: false
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Created by user ID',
    example: 6,
    required: false
  })
  @IsOptional()
  created_by?: number;
}