// payment-method/dto/set-default-card.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DefaultCart {
  @ApiProperty({ description: 'Payment method ID', example: 'pm_123456789' })
  @IsString()
  method_id: string;
}