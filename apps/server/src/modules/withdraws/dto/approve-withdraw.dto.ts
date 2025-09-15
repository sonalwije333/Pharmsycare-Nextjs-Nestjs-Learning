import { PickType } from '@nestjs/swagger';
import { Withdraw } from '../entities/withdraw.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import {WithdrawStatus} from "../../../common/enums/enums";

export class ApproveWithdrawDto extends PickType(Withdraw, [
    'id',
    'status',
] as const) {
    @ApiProperty({ description: 'Withdraw ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @ApiProperty({ enum: WithdrawStatus, description: 'New status for the withdraw', example: WithdrawStatus.APPROVED })
    @IsEnum(WithdrawStatus)
    @IsNotEmpty()
    status: WithdrawStatus;
}