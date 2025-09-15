import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Withdraw } from '../entities/withdraw.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWithdrawDto extends PickType(Withdraw, [
    'amount',
    'note',
    'details',
    'payment_method',
    'shop_id',
] as const) {
    @ApiProperty({ description: 'Withdrawal amount', example: 100.50 })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ description: 'Payment method', example: 'bank_transfer' })
    @IsString()
    @IsNotEmpty()
    payment_method: string;

    @ApiProperty({ description: 'Payment details (JSON)', example: '{"bank_name": "ABC Bank", "account_number": "1234567890"}' })
    @IsString()
    @IsNotEmpty()
    details: string;

    @ApiProperty({ description: 'Shop ID', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    shop_id: number;

    @ApiPropertyOptional({ description: 'Additional note', example: 'Monthly withdrawal request' })
    @IsOptional()
    @IsString()
    note: string;
}