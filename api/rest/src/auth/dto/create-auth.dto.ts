// auth/dto/create-auth.dto.ts
import { PartialType, PickType, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength, IsString, IsBoolean, IsNumber } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Permission } from '../../common/enums/enums';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@demo.com',
    format: 'email',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password - minimum 6 characters',
    example: 'demodemo',
    minLength: 6,
    format: 'password',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User permission role',
    enum: Permission,
    default: Permission.CUSTOMER,
    example: Permission.SUPER_ADMIN,
    required: false
  })
  @IsEnum(Permission)
  permission: Permission = Permission.CUSTOMER;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@demo.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'demodemo',
    format: 'password'
  })
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  refreshToken: string;
}

export class SocialLoginDto {
  @ApiProperty({
    description: 'Social provider name',
    example: 'google',
    enum: ['google', 'facebook', 'apple']
  })
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: 'Social access token from provider',
    example: 'ya29.a0AfH6SMC...',
  })
  @IsNotEmpty()
  access_token: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'oldPassword123',
    format: 'password'
  })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'New password - minimum 6 characters',
    example: 'newPassword123',
    minLength: 6,
    format: 'password'
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}

export class ForgetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;
}

export class VerifyForgetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  token: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password - minimum 6 characters',
    example: 'newPassword123',
    minLength: 6,
    format: 'password'
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class AuthResponse {
  @ApiProperty({
    description: 'JWT access token (legacy field for REST clients)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
    default: 900
  })
  expiresIn: number;

  @ApiProperty({
    description: 'User permissions',
    example: ['customer', 'store_owner'],
    type: [String]
  })
  permissions: string[];

  @ApiProperty({
    description: 'Primary user role',
    example: 'customer',
    required: false
  })
  role?: string;

  @ApiProperty({
    description: 'Authenticated user details',
    type: () => User
  })
  user: User;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'OTP session ID',
    example: 'otp_123456789'
  })
  @IsNotEmpty()
  otp_id: string;

  @ApiProperty({
    description: 'OTP verification code',
    example: '123456',
    minLength: 6,
    maxLength: 6
  })
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890'
  })
  @IsNotEmpty()
  phone_number: string;
}

export class OtpResponse {
  @ApiProperty({
    description: 'OTP session ID',
    example: 'otp_123456789'
  })
  id: string;

  @ApiProperty({
    description: 'Response message',
    example: 'OTP sent successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890'
  })
  phone_number: string;

  @ApiProperty({
    description: 'OTP provider',
    example: 'twilio'
  })
  provider: string;

  @ApiProperty({
    description: 'Contact exists in system',
    example: true
  })
  is_contact_exist: boolean;
}

export class OtpDto {
  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890'
  })
  @IsNotEmpty()
  phone_number: string;
}

export class OtpLoginDto {
  @ApiProperty({
    description: 'OTP session ID',
    example: 'otp_123456789'
  })
  @IsNotEmpty()
  otp_id: string;

  @ApiProperty({
    description: 'OTP verification code',
    example: '123456',
    minLength: 6,
    maxLength: 6
  })
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890'
  })
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'User name (optional)',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'User email (optional)',
    example: 'john@example.com',
    format: 'email',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}