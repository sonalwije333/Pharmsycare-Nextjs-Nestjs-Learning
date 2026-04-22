// src/withdraws/dto/approve-withdraw.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { WithdrawStatus } from '../entities/withdraw.entity';

export class ApproveWithdrawDto {
  @ApiProperty({
    description: 'Withdraw status',
    enum: ['approved', 'pending', 'on_hold', 'rejected', 'processing'],
    example: 'approved',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
  })
  @IsString()
  @IsIn(['approved', 'pending', 'on_hold', 'rejected', 'processing'])
  status?: string;
}

export const ApproveWithdrawStatusMap: Record<string, WithdrawStatus> = {
  approved: WithdrawStatus.APPROVED,
  pending: WithdrawStatus.PENDING,
  on_hold: WithdrawStatus.ON_HOLD,
  rejected: WithdrawStatus.REJECTED,
  processing: WithdrawStatus.PROCESSING,
};