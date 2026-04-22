// authors/entities/author.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';

@Entity('authors')
export class Author extends CoreEntity {
  @ApiProperty({ description: 'Author ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Author name', example: 'Kaity lerry' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Author bio', required: false })
  @Column('text', { nullable: true })
  bio?: string;

  @ApiProperty({ description: 'Birth date', required: false })
  @Column({ nullable: true })
  born?: string;

  @ApiProperty({
    description: 'Cover image',
    type: Attachment,
    required: false,
  })
  @Column('json', { nullable: true })
  cover_image?: Attachment;

  @ApiProperty({ description: 'Death date', required: false })
  @Column({ nullable: true })
  death?: string;

  @ApiProperty({
    description: 'Author image',
    type: Attachment,
    required: false,
  })
  @Column('json', { nullable: true })
  image?: Attachment;

  @ApiProperty({ description: 'Is approved', example: true })
  @Column({ default: true })
  is_approved?: boolean;

  @ApiProperty({ description: 'Languages', required: false })
  @Column({ nullable: true })
  languages?: string;

  @ApiProperty({ description: 'Products count', example: 5 })
  @Column({ default: 0 })
  products_count?: number;

  @ApiProperty({ description: 'Quote', required: false })
  @Column('text', { nullable: true })
  quote?: string;

  @ApiProperty({ description: 'Author slug', example: 'kaity-lerry' })
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

  @ApiProperty({ description: 'Language code', default: 'en' })
  @Column({ default: 'en' })
  language?: string;

  @ApiProperty({ description: 'Translated languages', type: [String] })
  @Column('simple-array', { nullable: true })
  translated_languages?: string[];

  @ApiProperty({ description: 'Shop ID', required: false })
  @Column({ nullable: true })
  shop_id?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
