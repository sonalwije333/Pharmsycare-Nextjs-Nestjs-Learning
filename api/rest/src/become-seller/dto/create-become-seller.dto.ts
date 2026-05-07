import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Attachment } from '../../common/entities/attachment.entity';

export class AttachmentDto {
  @ApiProperty({ required: false, type: Number, example: 1, description: 'Attachment ID' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ required: false, type: String, example: 'thumbnail.jpg', description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiProperty({ required: false, type: String, example: 'original.jpg', description: 'Original image URL' })
  @IsString()
  @IsOptional()
  original?: string;

  @ApiProperty({ required: false, type: String, example: 'file.jpg', description: 'File name' })
  @IsString()
  @IsOptional()
  file_name?: string;
}

export class SellingStepItemDto {
  @ApiProperty({ required: false, type: String, example: 'step-1', description: 'Step ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ type: String, example: 'Create Account', description: 'Step title' })
  @IsString()
  title: string;

  @ApiProperty({ type: String, example: 'Sign up for free account', description: 'Step description' })
  @IsString()
  description: string;

  @ApiProperty({ type: AttachmentDto, required: false, description: 'Step image' })
  @ValidateNested()
  @Type(() => AttachmentDto)
  @IsOptional()
  image?: AttachmentDto;
}

export class BusinessPurposeItemDto {
  @ApiProperty({ required: false, type: String, example: 'purpose-1', description: 'Purpose ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ type: String, example: 'Start Selling', description: 'Purpose title' })
  @IsString()
  title: string;

  @ApiProperty({ type: String, example: 'Reach more customers', description: 'Purpose description' })
  @IsString()
  description: string;

  @ApiProperty({ 
    type: Object, 
    example: { value: 'StoreIcon' },
    description: 'Icon object with value property',
  })
  @IsObject()
  icon: {
    value: string;
  };
}

export class FaqItemsDto {
  @ApiProperty({ type: String, example: 'How to start?', description: 'FAQ question title' })
  @IsString()
  title: string;

  @ApiProperty({ type: String, example: 'Follow these steps...', description: 'FAQ answer description' })
  @IsString()
  description: string;
}

export class BecomeSellerOptionsDto {
  @ApiProperty({ type: AttachmentDto, description: 'Banner image' })
  @ValidateNested()
  @Type(() => AttachmentDto)
  banner: AttachmentDto;

  @ApiProperty({ type: String, example: 'Start Selling In 4 Simple Steps', description: 'Selling steps section title' })
  @IsString()
  sellingStepsTitle: string;

  @ApiProperty({ type: String, example: 'Launching your online business with PickBazar is a breeze.', description: 'Selling steps section description' })
  @IsString()
  sellingStepsDescription: string;

  @ApiProperty({ type: [SellingStepItemDto], description: 'Array of selling steps' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SellingStepItemDto)
  sellingStepsItem: SellingStepItemDto[];

  @ApiProperty({ type: String, example: 'Why Sell with PickBazar', description: 'Purpose section title' })
  @IsString()
  purposeTitle: string;

  @ApiProperty({ type: String, example: 'Embarking on your digital entrepreneurship journey', description: 'Purpose section description' })
  @IsString()
  purposeDescription: string;

  @ApiProperty({ type: [BusinessPurposeItemDto], description: 'Array of business purposes' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessPurposeItemDto)
  purposeItems: BusinessPurposeItemDto[];

  @ApiProperty({ type: String, example: 'Fee and Commission', description: 'Commission section title' })
  @IsString()
  commissionTitle: string;

  @ApiProperty({ type: String, example: 'Starting your online business with PickBazar is easy.', description: 'Commission section description' })
  @IsString()
  commissionDescription: string;

  @ApiProperty({ type: String, example: 'Frequently Ask Question', description: 'FAQ section title' })
  @IsString()
  faqTitle: string;

  @ApiProperty({ type: String, example: 'Answers to common questions about our services', description: 'FAQ section description' })
  @IsString()
  faqDescription: string;

  @ApiProperty({ type: [FaqItemsDto], description: 'Array of FAQ items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemsDto)
  faqItems: FaqItemsDto[];
}

export class CommissionItemDto {
  @ApiProperty({ required: false, type: Number, example: 1, description: 'Commission ID' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ type: String, example: 'Level One', description: 'Commission level name' })
  @IsString()
  level: string;

  @ApiProperty({ type: String, example: 'Charges for listing a product', description: 'Sub level description' })
  @IsString()
  sub_level: string;

  @ApiProperty({ type: String, example: 'Earn attractive commissions with every sale', description: 'Commission description' })
  @IsString()
  description: string;

  @ApiProperty({ type: Number, example: 200, description: 'Minimum balance required' })
  @IsNumber()
  min_balance: number;

  @ApiProperty({ type: Number, example: 3000, description: 'Maximum balance limit' })
  @IsNumber()
  max_balance: number;

  @ApiProperty({ type: Number, example: 15, description: 'Commission percentage' })
  @IsNumber()
  commission: number;

  @ApiProperty({ type: AttachmentDto, description: 'Commission image/icon' })
  @ValidateNested()
  @Type(() => AttachmentDto)
  image: AttachmentDto;

  @ApiProperty({ default: 'en', type: String, example: 'en', description: 'Language code' })
  @IsString()
  @IsOptional()
  language?: string;
}

export class CreateBecomeSellerDto {
  @ApiProperty({ 
    type: () => BecomeSellerOptionsDto,
    description: 'Page options configuration containing all content sections',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BecomeSellerOptionsDto)
  page_options: BecomeSellerOptionsDto;

  @ApiProperty({ 
    type: () => [CommissionItemDto],
    description: 'Array of commission items for different levels',
    example: [
      {
        level: 'Level One',
        sub_level: 'Charges for listing a product',
        description: 'Earn attractive commissions with every sale',
        min_balance: 200,
        max_balance: 3000,
        commission: 15,
        image: { thumbnail: 'image.jpg', original: 'image.jpg' }
      }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommissionItemDto)
  commissions: CommissionItemDto[];

  @ApiProperty({ 
    default: 'en', 
    required: false,
    type: String,
    example: 'en',
    description: 'Language code for the configuration',
  })
  @IsString()
  @IsOptional()
  language?: string = 'en';
}