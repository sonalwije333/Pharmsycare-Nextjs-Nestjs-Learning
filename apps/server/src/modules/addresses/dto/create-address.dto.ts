import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddressType } from '../../../common/enums/AddressType';

class UserAddressDto {
  @ApiProperty()
  @IsString()
  street_address: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  zip: string;
}

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsBoolean()
  default: boolean;

  @ApiProperty({ type: UserAddressDto })
  @ValidateNested()
  @Type(() => UserAddressDto)
  address: UserAddressDto;

  @ApiProperty({ enum: AddressType })
  @IsEnum(AddressType)
  type: AddressType;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  customer_id: number;
}