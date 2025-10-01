import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DefaultCartDto {
  @ApiProperty({ description: 'Payment method ID', example: 'pm_123456789' })
  @IsNotEmpty()
  @IsString()
  method_id: string;
}