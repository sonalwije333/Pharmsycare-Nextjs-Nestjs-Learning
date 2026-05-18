import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { OwnershipTransferStatus } from 'src/common/enums/ownership-transfer.enum';

export class CreateOwnershipTransferDto {
  @ApiProperty({
    description: 'Transaction identifier',
    example: '2024-08-03-0001',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  transaction_identifier?: string;

  @ApiProperty({
    description: 'Previous owner ID',
    example: 48,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  previous_owner_id?: number;

  @ApiProperty({
    description: 'Current owner ID',
    example: 49,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  current_owner_id?: number;

  @ApiProperty({
    description: 'Transfer message',
    example: 'Transferring shop ownership',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Created by user ID',
    example: 6,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  created_by?: number;

  @ApiProperty({
    description: 'Transfer status',
    enum: OwnershipTransferStatus,
    required: false,
    default: OwnershipTransferStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OwnershipTransferStatus)
  status?: OwnershipTransferStatus = OwnershipTransferStatus.PENDING;
}