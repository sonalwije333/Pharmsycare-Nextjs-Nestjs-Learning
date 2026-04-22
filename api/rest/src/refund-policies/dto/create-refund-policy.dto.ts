// refund-policies/dto/create-refund-policy.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateRefundPolicyDto {
  @ApiProperty({
    description: 'Policy title',
    example: 'Vendor Return Policy',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Policy status',
    enum: ['approved', 'pending', 'rejected'],
    example: 'approved',
  })
  @IsString()
  @IsIn(['approved', 'pending', 'rejected'])
  status: string;

  @ApiProperty({
    description: 'Target audience',
    enum: ['vendor', 'customer'],
    example: 'vendor',
  })
  @IsString()
  @IsIn(['vendor', 'customer'])
  target: string;

  @ApiProperty({
    description: 'Policy slug',
    example: 'vendor-return-policy',
    required: false
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Policy description',
    example: 'Our vendor return policy ensures that you can return products within 30 days...',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Policy language',
    example: 'en',
    default: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;
}