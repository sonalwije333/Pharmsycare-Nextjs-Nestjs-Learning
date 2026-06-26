// types/entities/type.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attachment } from 'src/common/entities/attachment.entity';

export class Banner {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: () => Attachment })
  image: Attachment;
}

export class TypeSettings {
  @ApiProperty({ example: true })
  isHome: boolean;

  @ApiProperty({ example: 'grid' })
  layoutType: string;

  @ApiProperty({ example: 'classic' })
  productCard: string;
}

@Entity('types')
export class Type extends CoreEntity {
  @ApiProperty({ description: 'Type ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Type name', example: 'Grocery' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Type slug', example: 'grocery' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ type: () => Attachment, description: 'Type image', required: false })
  @Column('json', { nullable: true })
  image: Attachment;

  @ApiProperty({ description: 'Type icon', required: false })
  @Column({ nullable: true })
  icon: string;

  @ApiProperty({ type: [Banner], description: 'Banners', required: false })
  @Column('json', { nullable: true })
  banners?: Banner[];

  @ApiProperty({ type: [Attachment], description: 'Promotional sliders', required: false })
  @Column('json', { nullable: true })
  promotional_sliders?: Attachment[];

  @ApiProperty({ type: () => TypeSettings, description: 'Type settings', required: false })
  @Column('json', { nullable: true })
  settings?: TypeSettings;

  @ApiProperty({ description: 'Language', example: 'en', default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Translated languages', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}