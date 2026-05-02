// users/dto/create-user.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsObject, IsOptional } from 'class-validator';
import { User } from '../entities/user.entity';
import { CreateProfileDto } from './create-profile.dto';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { Permission } from '../../common/enums/enums';

export class CreateUserDto extends PickType(User, [
  'name',
  'email',
  'password',
] as const) {
  @ApiProperty({
    description: 'User addresses',
    type: [CreateAddressDto],
    required: false
  })
  @IsArray()
  @IsOptional()
  address?: CreateAddressDto[];

  @ApiProperty({
    description: 'User profile',
    type: CreateProfileDto,
    required: false
  })
  @IsObject()
  @IsOptional()
  profile?: CreateProfileDto;

  @ApiProperty({
    description: 'User permission role',
    enum: Permission,
    default: Permission.CUSTOMER,
    example: Permission.CUSTOMER
  })
  @IsEnum(Permission)
  permission: Permission = Permission.CUSTOMER;
}