import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { FaqType } from 'src/common/enums/faq-type.enum';

export class CreateFaqDto {
  @ApiProperty({
    description: 'FAQ title',
    example: 'What is your return policy?',
    type: String,
  })
  @IsString()
  faq_title: string;

  @ApiProperty({
    description: 'FAQ description',
    example: 'We have a flexible return policy...',
    type: String,
  })
  @IsString()
  faq_description: string;

  @ApiProperty({ 
    description: 'FAQ type', 
    example: FaqType.GLOBAL, 
    required: false,
    enum: FaqType,
    default: FaqType.GLOBAL,
  })
  @IsEnum(FaqType)
  @IsOptional()
  faq_type?: FaqType = FaqType.GLOBAL;

  @ApiProperty({
    description: 'Issued by',
    example: 'Super Admin',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  issued_by?: string;

  @ApiProperty({ 
    description: 'Shop ID', 
    required: false,
    type: Number,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  shop_id?: number;

  @ApiProperty({ 
    description: 'User ID', 
    required: false,
    type: String,
    example: '123',
  })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiProperty({ 
    description: 'Language code', 
    default: 'en',
    type: String,
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string = 'en';
}