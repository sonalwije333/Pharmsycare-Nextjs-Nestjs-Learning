// orders/dto/create-order-status.dto.ts
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
import { OrderStatus } from '../entities/order-status.entity';

export class CreateOrderStatusDto extends PickType(OrderStatus, [
  'name',
  'color',
  'serial',
  'language',
] as const) {
  @ApiProperty({ description: 'Order status name', example: 'Order Received' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Status color', example: '#23b848' })
  @IsString()
  color: string;

  @ApiProperty({ description: 'Serial number', example: 1 })
  @IsNumber()
  serial: number;

  @ApiProperty({ description: 'Language', example: 'en' })
  @IsString()
  language: string;
}

export class UpdateOrderStatusDto extends PartialType(CreateOrderStatusDto) {}