// become-seller/entities/become-seller.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CoreEntity } from '../../common/entities/core.entity';

export class Attachment {
  @ApiProperty({ required: false })
  id?: number;

  @ApiProperty({ required: false })
  thumbnail?: string;

  @ApiProperty({ required: false })
  original?: string;

  @ApiProperty({ required: false })
  file_name?: string;

  @ApiProperty({ required: false })
  created_at?: Date;

  @ApiProperty({ required: false })
  updated_at?: Date;
}

export class SellingStepItem {
  @ApiProperty({ required: false })
  id?: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: Attachment, required: false })
  @Type(() => Attachment)
  image?: Attachment;
}

export class BusinessPurposeItem {
  @ApiProperty({ required: false })
  id?: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: Object })
  icon: {
    value: string;
  };
}

export class FaqItems {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}

export class BecomeSellerOptions {
  @ApiProperty({ type: Attachment })
  @Type(() => Attachment)
  banner: Attachment;

  @ApiProperty()
  sellingStepsTitle: string;

  @ApiProperty()
  sellingStepsDescription: string;

  @ApiProperty({ type: [SellingStepItem] })
  @Type(() => SellingStepItem)
  sellingStepsItem: SellingStepItem[];

  @ApiProperty()
  purposeTitle: string;

  @ApiProperty()
  purposeDescription: string;

  @ApiProperty({ type: [BusinessPurposeItem] })
  @Type(() => BusinessPurposeItem)
  purposeItems: BusinessPurposeItem[];

  @ApiProperty()
  commissionTitle: string;

  @ApiProperty()
  commissionDescription: string;

  @ApiProperty()
  faqTitle: string;

  @ApiProperty()
  faqDescription: string;

  @ApiProperty({ type: [FaqItems] })
  @Type(() => FaqItems)
  faqItems: FaqItems[];
}

export class CommissionItem {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  level: string;

  @ApiProperty()
  sub_level: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  min_balance: number;

  @ApiProperty()
  max_balance: number;

  @ApiProperty()
  commission: number;

  @ApiProperty({ type: Attachment })
  @Type(() => Attachment)
  image: Attachment;

  @ApiProperty()
  language?: string;
}

@Entity('become_seller')
export class BecomeSeller extends CoreEntity {
  @ApiProperty({ description: 'Become Seller ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: Object })
  @Column('json')
  page_options: {
    page_options: BecomeSellerOptions;
  };

  @ApiProperty({ type: [CommissionItem] })
  @Column('json')
  commissions: CommissionItem[];

  @ApiProperty({ description: 'Language code', default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
