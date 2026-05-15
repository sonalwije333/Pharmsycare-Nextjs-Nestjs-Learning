import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  Index 
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Attachment } from 'src/common/entities/attachment.entity';
import { ShopSocials } from 'src/settings/entities/setting.entity';

@Entity('manufacturers')
export class Manufacturer {
  @ApiProperty({ description: 'Manufacturer ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Manufacturer name', example: 'Too cool publication', type: String })
  @Column({ length: 255 })
  @Index()
  name: string;

  @ApiProperty({ description: 'Manufacturer slug', example: 'too-cool-publication', type: String })
  @Column({ length: 255, nullable: true })
  @Index()
  slug?: string;

  @ApiProperty({ description: 'Manufacturer description', required: false, type: String })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Manufacturer website', required: false, type: String })
  @Column({ length: 255, nullable: true })
  website?: string;

  @ApiProperty({ description: 'Cover image', type: () => Attachment, required: false })
  @Column({ type: 'json', nullable: true })
  cover_image?: Attachment;

  @ApiProperty({ description: 'Manufacturer image/logo', type: () => Attachment, required: false })
  @Column({ type: 'json', nullable: true })
  image?: Attachment;

  @ApiProperty({ description: 'Social media links', type: () => ShopSocials, required: false })
  @Column({ type: 'json', nullable: true })
  socials?: ShopSocials;

  @ApiProperty({ description: 'Is manufacturer approved', default: false, type: Boolean })
  @Column({ type: 'boolean', default: false })
  is_approved?: boolean;

  @ApiProperty({ description: 'Number of products', default: 0, type: Number })
  @Column({ type: 'int', default: 0 })
  products_count?: number;

  @ApiProperty({ description: 'Type ID', required: false, type: Number })
  @Column({ type: 'int', nullable: true })
  type_id?: number;

  @ApiProperty({ description: 'Shop ID', required: false, type: String })
  @Column({ length: 255, nullable: true })
  shop_id?: string;

  @ApiProperty({ description: 'Language code', default: 'en', type: String })
  @Column({ length: 10, default: 'en' })
  language?: string;

  @ApiProperty({ description: 'Translated languages', type: [String], required: false })
  @Column({ type: 'json', nullable: true })
  translated_languages?: string[];

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