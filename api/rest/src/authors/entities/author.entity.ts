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
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';

@Entity('authors')
export class Author extends CoreEntity {
  @ApiProperty({ description: 'Author ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Author name', example: 'Kaity lerry', type: String })
  @Column()
  name: string;

  @ApiProperty({ description: 'Author bio', required: false, type: String, example: 'An author is the creator...' })
  @Column('text', { nullable: true })
  bio?: string;

  @ApiProperty({ description: 'Birth date', required: false, type: String, example: '1965-06-21T18:00:00.000Z' })
  @Column({ nullable: true })
  born?: string;

  @ApiProperty({
    description: 'Cover image',
    type: Attachment,
    required: false,
  })
  @Column('json', { nullable: true })
  cover_image?: Attachment;

  @ApiProperty({ description: 'Death date', required: false, type: String, example: null })
  @Column({ nullable: true })
  death?: string;

  @ApiProperty({
    description: 'Author image',
    type: Attachment,
    required: false,
  })
  @Column('json', { nullable: true })
  image?: Attachment;

  @ApiProperty({ description: 'Is approved', example: true, type: Boolean, default: true })
  @Column({ default: true })
  is_approved?: boolean;

  @ApiProperty({ description: 'Languages', required: false, type: String, example: 'English' })
  @Column({ nullable: true })
  languages?: string;

  @ApiProperty({ description: 'Products count', example: 5, type: Number, default: 0 })
  @Column({ default: 0 })
  products_count?: number;

  @ApiProperty({ description: 'Quote', required: false, type: String, example: 'All writers are vain...' })
  @Column('text', { nullable: true })
  quote?: string;

  @ApiProperty({ description: 'Author slug', example: 'kaity-lerry', type: String })
  @Column({ unique: true })
  slug?: string;

  @ApiProperty({
    description: 'Social links',
    type: () => ShopSocials,
    isArray: true,
    required: false,
  })
  @Column('json', { nullable: true })
  socials?: ShopSocials[];

  @ApiProperty({ description: 'Language code', default: 'en', type: String, example: 'en' })
  @Column({ default: 'en' })
  language?: string;

  @ApiProperty({ description: 'Translated languages', type: [String], example: ['en', 'es', 'fr'] })
  @Column('simple-array', { nullable: true })
  translated_languages?: string[];

  @ApiProperty({ description: 'Shop ID', required: false, type: String, example: '1' })
  @Column({ nullable: true })
  shop_id?: string;

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