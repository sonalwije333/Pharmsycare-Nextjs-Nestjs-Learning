import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsPhoneNumber,
  IsNumber,
} from 'class-validator';
import { PermissionType } from '../../../common/enums/PermissionType.enum';


export class UserProfileResponse {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User email', example: 'admin@demo.com' })
  email: string;

  @ApiPropertyOptional({ description: 'User phone', example: '+94761781419' })
  phone?: string;

  @ApiPropertyOptional({ description: 'User avatar', example: 'avatar.jpg' })
  avatar?: string;

  @ApiPropertyOptional({ description: 'Wallet points', example: 100 })
  wallet_points?: number;
}

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'admin@demo.com' })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ description: 'User password', example: 'demodemo' })
  password: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @IsOptional()
  @IsPhoneNumber()
  @ApiPropertyOptional({ description: 'User phone', example: '+94761781419' })
  phone?: string;

  @IsEnum(PermissionType, {
    message: `permission must be one of: ${Object.values(PermissionType).join(', ')}`,
  })
  @ApiPropertyOptional({
    enum: PermissionType,
    default: PermissionType.SUPER_ADMIN,
    description: 'User role permission',
  })
  permission?: PermissionType = PermissionType.SUPER_ADMIN;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'admin@demo.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'User password', example: 'demodemo' })
  password: string;
}
export class SocialLoginDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Provider (google/facebook)', example: 'google' })
  provider: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Access token from provider' })
  access_token: string;
}
export class OtpLoginDto {
  @IsPhoneNumber()
  @ApiProperty({ description: 'Phone number', example: '+94761781419' })
  phone: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'OTP code', example: '123456' })
  code: string;
}
export class OtpDto {
  @IsPhoneNumber()
  @ApiProperty({ description: 'Phone number', example: '+94761781419' })
  phone: string;
}

export class VerifyOtpDto {
  @IsPhoneNumber()
  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  phone: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'OTP code', example: '123456' })
  code: string;
}
export class ForgetPasswordDto {
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;
}
export class VerifyForgetPasswordDto {
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Reset token', example: '123456' })
  token: string;
}
export class ResetPasswordDto {
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Reset token', example: '123456' })
  token: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ description: 'New password', example: 'newpassword123' })
  password: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Old password', example: 'oldpassword123' })
  old_password: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ description: 'New password', example: 'newpassword123' })
  new_password: string;
}

export class AuthResponse {
  @ApiProperty({ description: 'JWT access token' })
  token: string;

  @ApiProperty({
    type: [String],
    description: 'List of user permissions',
    example: ['customer'],
  })
  permissions: string[];

  @ApiPropertyOptional({
    description: 'Primary user role',
    example: 'customer',
  })
  role?: string;

  @ApiProperty({
    description: 'User profile information',
    type: UserProfileResponse,
  })
  user: UserProfileResponse;
}
