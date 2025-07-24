import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

enum PermissionType {
  SUPER_ADMIN = 'super_admin',
  STORE_OWNER = 'store_owner',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'admin@demo.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'User password', example: 'demodemo' })
  password: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @IsEnum(PermissionType, {
    message: `permission must be one of: ${Object.values(PermissionType).join(', ')}`,
  })
  @ApiProperty({ enum: PermissionType, default: PermissionType.SUPER_ADMIN })
  permission: PermissionType = PermissionType.SUPER_ADMIN;
}

export class AuthResponse {
  @ApiProperty({ description: 'Token to access' })
  token: string;

  @ApiProperty({ description: 'User permissions list' })
  permissions: string[];

  @ApiProperty({ description: 'User role' })
  role?: string;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'admin@demo.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'User password', example: 'demodemo' })
  password: string;
}
