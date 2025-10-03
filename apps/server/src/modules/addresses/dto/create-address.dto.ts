import { PickType } from '@nestjs/swagger';
import { Address } from '../entities/address.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateAddressDto extends PickType(Address, [
  'title',
  'type',
  'default',
  'address',
]) {
  @ApiProperty()
  @IsNumber()
  customer_id: number;
}