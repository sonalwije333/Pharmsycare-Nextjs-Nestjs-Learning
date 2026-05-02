// faqs/entities/faq.entity.ts
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

@Entity('faqs')
export class Faq extends CoreEntity {
  @ApiProperty({ description: 'FAQ ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'FAQ title',
    example: 'What is your return policy?',
  })
  @Column()
  faq_title: string;

  @ApiProperty({
    description: 'FAQ slug',
    example: 'what-is-your-return-policy',
  })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    description: 'FAQ description',
    example: 'We have a flexible return policy...',
  })
  @Column('text')
  faq_description: string;

  @ApiProperty({ description: 'FAQ type', example: 'global', required: false })
  @Column({ nullable: true })
  faq_type?: string;

  @ApiProperty({
    description: 'Issued by',
    example: 'Super Admin',
    required: false,
  })
  @Column({ nullable: true })
  issued_by?: string;

  @ApiProperty({ description: 'Shop ID', required: false })
  @Column({ nullable: true })
  shop_id?: number;

  @ApiProperty({ description: 'User ID', required: false })
  @Column({ nullable: true })
  user_id?: string;

  @ApiProperty({ description: 'Language code', default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Translated languages', type: [String] })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
