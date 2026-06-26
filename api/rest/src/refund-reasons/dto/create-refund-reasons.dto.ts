// refund-reasons/dto/create-refund-reasons.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRefundReasonDto {
  @ApiProperty({
    description: 'Refund reason name',
    example: 'Product damaged on arrival',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Reason slug',
    example: 'product-damaged-on-arrival',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Reason language',
    example: 'en',
    default: 'en',
    required: false
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'Legacy language field (backward compatibility)',
    example: 'en',
    required: false,
  })
  @IsString()
  @IsOptional()
  languages?: string;
}