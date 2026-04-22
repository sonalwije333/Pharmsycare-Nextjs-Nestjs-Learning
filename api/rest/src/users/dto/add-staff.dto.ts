// users/dto/add-staff.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class AddStaffDto {
  @ApiProperty({
    description: 'Staff email address',
    example: 'staff@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Staff password - minimum 6 characters',
    example: 'password123',
    minLength: 6,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Staff full name',
    example: 'John Staff',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Shop ID to assign staff to',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  shop_id: number;
}
