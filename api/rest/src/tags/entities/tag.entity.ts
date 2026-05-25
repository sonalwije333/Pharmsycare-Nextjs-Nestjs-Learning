// tags/entities/tag.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Type } from 'src/types/entities/type.entity';
import { Product } from 'src/products/entities/product.entity';


@Entity('tags')
export class Tag extends CoreEntity {
  @ApiProperty({ description: 'Tag ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tag name', example: 'Electronics' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Tag slug', example: 'electronics' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: 'Parent tag ID', required: false })
  @Column({ nullable: true })
  parent: number;

  @ApiProperty({ description: 'Tag details', required: false })
  @Column('text', { nullable: true })
  details: string;

  @ApiProperty({ type: () => Attachment, description: 'Tag image', required: false })
  @Column('json', { nullable: true })
  image: Attachment;

  @ApiProperty({ description: 'Tag icon', required: false })
  @Column({ nullable: true })
  icon: string;

  @ApiProperty({ type: () => Type, description: 'Tag type', required: false })
  @Column('json', { nullable: true })
  type: Type;

  @ApiProperty({ type: () => [Product], description: 'Products with this tag', required: false })
  @Column('json', { nullable: true })
  products: Product[];

  @ApiProperty({ description: 'Tag language', example: 'en', default: 'en' })
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