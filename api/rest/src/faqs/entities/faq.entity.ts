import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { FaqType } from 'src/common/enums/faq-type.enum';

@Entity('faqs')
export class Faq extends CoreEntity {
  @ApiProperty({ description: 'FAQ ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'FAQ title',
    example: 'What is your return policy?',
    type: String,
  })
  @Column()
  faq_title: string;

  @ApiProperty({
    description: 'FAQ slug',
    example: 'what-is-your-return-policy',
    type: String,
  })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    description: 'FAQ description',
    example: 'We have a flexible return policy...',
    type: String,
  })
  @Column('text')
  faq_description: string;

  @ApiProperty({ 
    description: 'FAQ type', 
    example: FaqType.GLOBAL, 
    required: false,
    enum: FaqType,
    default: FaqType.GLOBAL,
  })
  @Column({ type: 'varchar', nullable: true, default: FaqType.GLOBAL })
  faq_type?: string;

  @ApiProperty({
    description: 'Issued by',
    example: 'Super Admin',
    required: false,
    type: String,
  })
  @Column({ nullable: true })
  issued_by?: string;

  @ApiProperty({ 
    description: 'Shop ID', 
    required: false,
    type: Number,
    example: 1,
  })
  @Column({ nullable: true })
  shop_id?: number;

  @ApiProperty({ 
    description: 'User ID', 
    required: false,
    type: String,
    example: '123',
  })
  @Column({ nullable: true })
  user_id?: string;

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