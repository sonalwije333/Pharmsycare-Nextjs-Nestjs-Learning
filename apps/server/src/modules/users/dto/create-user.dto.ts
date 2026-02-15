import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Permission, User } from '../entities/user.entity';
import { CreateAddressDto } from '../../addresses/dto/create-address.dto';
import { CreateProfileDto } from './create-profile.dto';
import { PermissionType } from '../../../common/enums/PermissionType.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Laman Doe',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'laman@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'pwd123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'User addresses',
    type: [CreateAddressDto],
    required: false,
  })
  @IsOptional()
  address?: CreateAddressDto[];

  @ApiPropertyOptional({
    description: 'User profile',
    type: CreateProfileDto,
    required: false,
  })
  @IsOptional()
  profile?: CreateProfileDto;

  @ApiProperty({
    description: 'User permission/role',
    enum: PermissionType,
    default: PermissionType.CUSTOMER,
    example: PermissionType.CUSTOMER,
  })
  @IsEnum(PermissionType, {
    message: `permission must be one of: ${Object.values(PermissionType).join(', ')}`,
  })
  permission: PermissionType = PermissionType.CUSTOMER;
}
