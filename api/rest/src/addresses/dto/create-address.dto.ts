import { ApiProperty } from '@nestjs/swagger';
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
import { AddressType } from 'src/common/enums/address-type.enum';


export class UserAddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Main St',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  street_address: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State',
    example: 'NY',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'ZIP/Postal code',
    example: '10001',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  zip: string;
}

export class CreateAddressDto {
  @ApiProperty({
    description: 'Address title',
    example: 'Home',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
    example: AddressType.SHIPPING,
  })
  @IsEnum(AddressType)
  @IsNotEmpty()
  type: AddressType;

  @ApiProperty({
    description: 'Set as default address',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  default?: boolean = false;

  @ApiProperty({
    description: 'Customer ID to associate address with',
    example: 1,
    type: Number,
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