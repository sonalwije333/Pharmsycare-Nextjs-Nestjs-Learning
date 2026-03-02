import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderPaymentDto {
  @ApiProperty({ description: 'Tracking number', example: 123456 })
  @Type(() => Number)
  @IsNumber()
  tracking_number: number;
}
