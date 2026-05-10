import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { FlashSaleType } from 'src/common/enums/flash-sale.enum';
@Entity('flash_sales')
export class FlashSale extends CoreEntity {
  @ApiProperty({ description: 'Flash sale ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Flash sale title',
    example: 'Limited-Time Offer: Act Fast!',
    type: String,
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Flash sale slug',
    example: 'limited-time-offer-act-fast',
    type: String,
  })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    description: 'Flash sale description',
    example: "Don't miss out on our incredible...",
    type: String,
  })
  @Column('text')
  description: string;

  @ApiProperty({ 
    description: 'Start date', 
    example: '2023-10-31 06:49:59',
    type: String,
  })
  @Column()
  start_date: string;

  @ApiProperty({ 
    description: 'End date', 
    example: '2024-11-29 18:00:00',
    type: String,
  })
  @Column()
  end_date: string;

  @ApiProperty({
    type: Attachment,
    description: 'Flash sale image',
    required: false,
  })
  @Column('json', { nullable: true })
  image?: Attachment;

  @ApiProperty({
    type: Attachment,
    description: 'Cover image',
    required: false,
  })
  @Column('json', { nullable: true })
  cover_image?: Attachment;

  @ApiProperty({ 
    description: 'Flash sale type', 
    enum: FlashSaleType,
    example: FlashSaleType.PERCENTAGE,
    type: String,
  })
  @Column()
  type: string;

  @ApiProperty({ 
    description: 'Discount rate', 
    example: '50',
    type: String,
  })
  @Column()
  rate: string;

  @ApiProperty({ 
    description: 'Sale status', 
    example: true,
    type: Boolean,
    default: true,
  })
  @Column({ default: true })
  sale_status: boolean;

  @ApiProperty({ 
    description: 'Sale builder configuration', 
    required: false,
    type: Object,
  })
  @Column('json', { nullable: true })
  sale_builder?: any;

  @ApiProperty({ 
    description: 'Language code', 
    default: 'en',
    type: String,
    example: 'en',
  })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ 
    description: 'Translated languages', 
    type: [String],
    example: ['en', 'es', 'fr'],
  })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ApiProperty({ 
    description: 'Product IDs', 
    type: [Number],
    required: false,
    example: [951, 952],
  })
  @Column('simple-array', { nullable: true })
  product_ids?: number[];

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