import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  MinLength,
  IsEnum,
} from 'class-validator';
import { PermissionType } from '../../../common/enums/PermissionType.enum';

export class CreateStaffDto {
  @ApiProperty({
    description: 'Staff name',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Staff email',
    example: 'staff@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Staff password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Shop ID',
    example: 1,
  })
  @IsNumber()
  shop_id: number;

  @ApiPropertyOptional({
    description: 'Staff permission',
    enum: PermissionType,
    example: PermissionType.STAFF,
    default: PermissionType.STAFF,
  })
  @IsOptional()
  @IsEnum(PermissionType)
  permission?: PermissionType;
}
