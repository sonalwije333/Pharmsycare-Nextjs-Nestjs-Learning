import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {RefundStatus} from "../../../common/enums/enums";

export class UpdateRefundStatusDto {
  @ApiProperty({ description: 'Refund status', enum: RefundStatus })
  @IsEnum(RefundStatus)
  status: RefundStatus;

  @ApiProperty({ description: 'Admin note', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}