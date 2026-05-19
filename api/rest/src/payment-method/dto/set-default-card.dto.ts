import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class SetDefaultCardDto {
  @ApiProperty({ description: 'Payment method ID', example: 'pm_123456789', type: String })
  @IsString()
  method_id: string;

  @ApiProperty({ description: 'User ID', type: Number })
  @IsNumber()
  user_id: number;
}