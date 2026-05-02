// orders/dto/get-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetOrderArgs {
  @ApiProperty({
    description: 'Order ID',
    example: 48,
    required: false
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: 'Order tracking number',
    example: '20240207303639',
    required: false
  })
  @IsOptional()
  @IsString()
  tracking_number?: string;
}