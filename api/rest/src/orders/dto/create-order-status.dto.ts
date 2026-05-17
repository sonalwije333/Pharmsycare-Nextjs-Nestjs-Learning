import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateOrderStatusDto {
  @ApiProperty({ description: 'Order status name', example: 'Order Received', type: String })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Status color', example: '#23b848', type: String })
  @IsString()
  color: string;

  @ApiProperty({ description: 'Serial number', example: 1, type: Number })
  @IsNumber()
  serial: number;

  @ApiProperty({ description: 'Language', example: 'en', type: String })
  @IsString()
  language: string;
}

export class UpdateOrderStatusDto extends PartialType(CreateOrderStatusDto) {}