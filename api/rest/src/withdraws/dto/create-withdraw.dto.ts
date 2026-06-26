// src/withdraws/dto/create-withdraw.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWithdrawDto {
  @ApiProperty({
    description: 'Withdrawal amount',
    example: 500,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Additional note for the withdrawal request',
    example: 'Please process this withdrawal by end of week',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    description: 'Payment details (bank account, mobile banking info, etc.)',
    example: 'Bank: City Bank, Account: 123456789, Routing: 987654321',
    required: false,
  })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({
    description: 'Payment method',
    example: 'Bank Transfer',
    enum: ['Bank Transfer', 'Bkash', 'Nagad', 'Rocket', 'PayPal', 'Cash'],
  })
  @IsString()
  payment_method: string;

  @ApiProperty({
    description: 'Shop ID requesting the withdrawal',
    example: 3,
  })
  @IsNumber()
  shop_id: number;
}