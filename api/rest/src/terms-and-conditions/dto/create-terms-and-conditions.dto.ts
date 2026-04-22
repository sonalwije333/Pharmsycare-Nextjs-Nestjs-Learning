// terms-and-conditions/dto/create-terms-and-conditions.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TermsAndConditions } from '../entities/terms-and-conditions.entity';

export class CreateTermsAndConditionsDto extends PickType(TermsAndConditions, [
  'title',
  'description',
] as const) {
  @ApiProperty({
    description: 'Terms title',
    example: 'Acceptance of Terms',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Terms description/content',
    example: 'By using this Website, you agree to comply with and be bound by these terms and conditions.',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Terms type',
    example: 'global',
    required: false
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Issued by',
    example: 'Super Admin',
    required: false
  })
  @IsString()
  @IsOptional()
  issued_by?: string;

  @ApiProperty({
    description: 'Language',
    example: 'en',
    default: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'Associated shop ID',
    required: false,
    example: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  shop_id?: number;
}