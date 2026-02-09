import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { PermissionType } from '../../../common/enums/PermissionType.enum';


// Define UserProfileResponse first
export class UserProfileResponse {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User email', example: 'admin@demo.com' })
  email: string;
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
  @ApiProperty({
    enum: PermissionType,
    default: PermissionType.CUSTOMER,
    description: 'User role permission',
  })
  permission: PermissionType = PermissionType.CUSTOMER;
}

export class AuthResponse {
  @ApiProperty({ description: 'JWT access token' })
  token: string;

  @ApiProperty({
    type: [String],
    description: 'List of user permissions',
    example: ['super_admin'],
  })
  permissions: string[];

  @ApiPropertyOptional({
    description: 'Primary user role',
    example: 'super_admin',
  })
  role?: string;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileResponse,
  })
  user: UserProfileResponse;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'admin@demo.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'User password', example: 'demodemo' })
  password: string;
}
