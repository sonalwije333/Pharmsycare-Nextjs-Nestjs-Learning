import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ShippingType } from '../../../common/enums/enums';

export class CreateShippingDto {
  @ApiProperty({
    description: 'Shipping name',
    example: 'Standard Shipping',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Shipping amount',
    example: 10.99,
    minimum: 0,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Is global shipping',
    example: true,
    default: false,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  is_global: boolean;

  @ApiProperty({
    description: 'Shipping type',
    enum: ShippingType,
    example: ShippingType.FIXED,
    default: ShippingType.FIXED,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(ShippingType)
  type: ShippingType;

  @ApiPropertyOptional({
    description: 'Shipping description',
    example: 'Standard delivery within 3-5 business days',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
