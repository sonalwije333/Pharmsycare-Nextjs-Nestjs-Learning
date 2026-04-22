// shipping/dto/create-shipping.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Shipping, ShippingType } from '../entities/shipping.entity';

export class CreateShippingDto extends PickType(Shipping, [
  'name',
  'amount',
  'is_global',
  'type',
] as const) {
  @ApiProperty({
    description: 'Shipping method name',
    example: 'Express Shipping',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Shipping amount',
    example: 25,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Is this a global shipping method',
    example: true,
    default: false,
    required: true
  })
  @IsOptional()
  is_global!: boolean;

  @ApiProperty({
    description: 'Shipping type',
    enum: ShippingType,
    example: ShippingType.FIXED
  })
  @IsEnum(ShippingType)
  type: ShippingType;

  @ApiProperty({
    description: 'Shop ID (if not global)',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  shop_id?: number;
}