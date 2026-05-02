// addresses/dto/create-address.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Address } from '../entities/address.entity';
import { AddressType } from '../../common/enums/enums';

// Define UserAddressDto FIRST before using it
export class UserAddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Main St',
  })
  @IsString()
  @IsNotEmpty()
  street_address: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'ZIP/Postal code',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty()
  zip: string;
}

export class CreateAddressDto extends PickType(Address, [
  'title',
  'type',
  'default',
] as const) {
  @ApiProperty({
    description: 'Customer ID to associate address with',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  customer_id: number;

  @ApiProperty({
    description: 'Address details',
    type: UserAddressDto,
  })
  @ValidateNested()
  @Type(() => UserAddressDto)
  @IsNotEmpty()
  address: UserAddressDto;
}
