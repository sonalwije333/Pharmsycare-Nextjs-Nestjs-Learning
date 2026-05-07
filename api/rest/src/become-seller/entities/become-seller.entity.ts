import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CoreEntity } from '../../common/entities/core.entity';

export class Attachment {
  @ApiProperty({ required: false, type: Number, description: 'Attachment ID', example: 1 })
  id?: number;

  @ApiProperty({ required: false, type: String, description: 'Thumbnail URL', example: 'https://example.com/thumbnail.jpg' })
  thumbnail?: string;

  @ApiProperty({ required: false, type: String, description: 'Original image URL', example: 'https://example.com/image.jpg' })
  original?: string;

  @ApiProperty({ required: false, type: String, description: 'File name', example: 'image.jpg' })
  file_name?: string;

  @ApiProperty({ required: false, type: Date, description: 'Creation timestamp' })
  created_at?: Date;

  @ApiProperty({ required: false, type: Date, description: 'Last update timestamp' })
  updated_at?: Date;
}

export class SellingStepItem {
  @ApiProperty({ required: false, type: String, description: 'Step ID', example: 'step-1' })
  id?: string;

  @ApiProperty({ type: String, description: 'Step title', example: 'Create Account' })
  title: string;

  @ApiProperty({ type: String, description: 'Step description', example: 'Sign up for free account' })
  description: string;

  @ApiProperty({ type: Attachment, required: false, description: 'Step image' })
  @Type(() => Attachment)
  image?: Attachment;
}

export class BusinessPurposeItem {
  @ApiProperty({ required: false, type: String, description: 'Purpose ID', example: 'purpose-1' })
  id?: string;

  @ApiProperty({ type: String, description: 'Purpose title', example: 'Start Selling' })
  title: string;

  @ApiProperty({ type: String, description: 'Purpose description', example: 'Reach more customers' })
  description: string;

  @ApiProperty({ type: Object, description: 'Icon object with value property', example: { value: 'StoreIcon' } })
  icon: {
    value: string;
  };
}

export class FaqItems {
  @ApiProperty({ type: String, description: 'FAQ question title', example: 'How to start?' })
  title: string;

  @ApiProperty({ type: String, description: 'FAQ answer description', example: 'Follow these steps...' })
  description: string;
}

export class BecomeSellerOptions {
  @ApiProperty({ type: Attachment, description: 'Banner image' })
  @Type(() => Attachment)
  banner: Attachment;

  @ApiProperty({ type: String, description: 'Selling steps section title', example: 'Start Selling In 4 Simple Steps' })
  sellingStepsTitle: string;

  @ApiProperty({ type: String, description: 'Selling steps section description', example: 'Launching your online business with PickBazar is a breeze.' })
  sellingStepsDescription: string;

  @ApiProperty({ type: [SellingStepItem], description: 'Array of selling steps' })
  @Type(() => SellingStepItem)
  sellingStepsItem: SellingStepItem[];

  @ApiProperty({ type: String, description: 'Purpose section title', example: 'Why Sell with PickBazar' })
  purposeTitle: string;

  @ApiProperty({ type: String, description: 'Purpose section description', example: 'Embarking on your digital entrepreneurship journey' })
  purposeDescription: string;

  @ApiProperty({ type: [BusinessPurposeItem], description: 'Array of business purposes' })
  @Type(() => BusinessPurposeItem)
  purposeItems: BusinessPurposeItem[];

  @ApiProperty({ type: String, description: 'Commission section title', example: 'Fee and Commission' })
  commissionTitle: string;

  @ApiProperty({ type: String, description: 'Commission section description', example: 'Starting your online business with PickBazar is easy.' })
  commissionDescription: string;

  @ApiProperty({ type: String, description: 'FAQ section title', example: 'Frequently Ask Question' })
  faqTitle: string;

  @ApiProperty({ type: String, description: 'FAQ section description', example: 'Answers to common questions about our services' })
  faqDescription: string;

  @ApiProperty({ type: [FaqItems], description: 'Array of FAQ items' })
  @Type(() => FaqItems)
  faqItems: FaqItems[];
}

export class CommissionItem {
  @ApiProperty({ type: Number, description: 'Commission ID', example: 1 })
  id?: number;

  @ApiProperty({ type: String, description: 'Commission level name', example: 'Level One' })
  level: string;

  @ApiProperty({ type: String, description: 'Sub level description', example: 'Charges for listing a product' })
  sub_level: string;

  @ApiProperty({ type: String, description: 'Commission description', example: 'Earn attractive commissions with every sale' })
  description: string;

  @ApiProperty({ type: Number, description: 'Minimum balance required', example: 200 })
  min_balance: number;

  @ApiProperty({ type: Number, description: 'Maximum balance limit', example: 3000 })
  max_balance: number;

  @ApiProperty({ type: Number, description: 'Commission percentage', example: 15 })
  commission: number;

  @ApiProperty({ type: Attachment, description: 'Commission image/icon' })
  @Type(() => Attachment)
  image: Attachment;

  @ApiProperty({ type: String, description: 'Language code', example: 'en', default: 'en' })
  language?: string;
}

@Entity('become_seller')
export class BecomeSeller extends CoreEntity {
  @ApiProperty({ description: 'Become Seller ID', type: Number, example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ 
    type: () => BecomeSellerOptions,
    description: 'Page options configuration containing all content sections',
  })
  @Column('json')
  page_options: BecomeSellerOptions;

  @ApiProperty({ 
    type: () => [CommissionItem],
    description: 'Array of commission items for different levels',
  })
  @Column('json')
  commissions: CommissionItem[];

  @ApiProperty({ 
    description: 'Language code', 
    default: 'en',
    type: String,
    example: 'en',
  })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp', type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp', type: Date })
  @UpdateDateColumn()
  updated_at: Date;
}