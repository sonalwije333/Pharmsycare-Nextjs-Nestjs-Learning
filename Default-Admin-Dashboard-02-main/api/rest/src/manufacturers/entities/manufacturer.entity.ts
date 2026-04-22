// manufacturers/entities/manufacturer.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('manufacturers')
export class Manufacturer {
  @ApiProperty({ description: 'Manufacturer ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Manufacturer name', example: 'Too cool publication' })
  @Column({ length: 255 })
  @Index()
  name: string;

  @ApiProperty({ description: 'Manufacturer slug', example: 'too-cool-publication' })
  @Column({ length: 255, nullable: true })
  @Index()
  slug?: string;

  @ApiProperty({ description: 'Manufacturer description', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Manufacturer website', required: false })
  @Column({ length: 255, nullable: true })
  website?: string;

  @ApiProperty({ description: 'Cover image', type: 'json', required: false })
  @Column({ type: 'json', nullable: true })
  cover_image?: any;

  @ApiProperty({ description: 'Manufacturer image/logo', type: 'json', required: false })
  @Column({ type: 'json', nullable: true })
  image?: any;

  @ApiProperty({ description: 'Social media links', type: 'json', required: false })
  @Column({ type: 'json', nullable: true })
  socials?: any;

  @ApiProperty({ description: 'Is manufacturer approved', default: false })
  @Column({ type: 'boolean', default: false })
  is_approved?: boolean;

  @ApiProperty({ description: 'Number of products', default: 0 })
  @Column({ type: 'int', default: 0 })
  products_count?: number;

  @ApiProperty({ description: 'Type ID', required: false })
  @Column({ type: 'int', nullable: true })
  type_id?: number;

  @ApiProperty({ description: 'Language code', default: 'en' })
  @Column({ length: 10, default: 'en' })
  language?: string;

  @ApiProperty({ description: 'Translated languages', type: [String], required: false })
  @Column({ type: 'json', nullable: true })
  translated_languages?: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}