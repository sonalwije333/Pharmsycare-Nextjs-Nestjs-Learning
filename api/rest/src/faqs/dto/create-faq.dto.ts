// faqs/dto/create-faq.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Faq } from '../entities/faq.entity';

export class CreateFaqDto {
  @ApiProperty({
    description: 'FAQ title',
    example: 'What is your return policy?',
  })
  @IsString()
  faq_title: string;

  @ApiProperty({
    description: 'FAQ description',
    example: 'We have a flexible return policy...',
  })
  @IsString()
  faq_description: string;

  @ApiProperty({ description: 'FAQ type', example: 'global', required: false })
  @IsString()
  @IsOptional()
  faq_type?: string;

  @ApiProperty({
    description: 'Issued by',
    example: 'Super Admin',
    required: false,
  })
  @IsString()
  @IsOptional()
  issued_by?: string;

  @ApiProperty({ description: 'Shop ID', required: false })
  @IsNumber()
  @IsOptional()
  shop_id?: number;

  @ApiProperty({ description: 'User ID', required: false })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiProperty({ description: 'Language code', default: 'en' })
  @IsString()
  @IsOptional()
  language?: string;
}
