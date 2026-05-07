import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { Type } from 'src/types/entities/type.entity';

@Entity('categories')
export class Category extends CoreEntity {
  @ApiProperty({ description: 'Category ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ 
    description: 'Category name', 
    example: 'Fruits & Vegetables',
    type: String,
  })
  @Column()
  name: string;

  @ApiProperty({ 
    description: 'Category slug', 
    example: 'fruits-vegetables',
    type: String,
  })
  @Column({ unique: true })
  slug: string;

  @ApiHideProperty()
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @ApiProperty({ 
    description: 'Parent category ID', 
    required: false,
    type: Number,
    example: 1,
  })
  @Column({ nullable: true })
  parent_id?: number;

  @ApiHideProperty()
  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  @ApiHideProperty()
  @ManyToOne(() => Type, { nullable: true })
  @JoinColumn({ name: 'type_id' })
  type?: Type;

  @ApiProperty({ 
    description: 'Category details', 
    required: false,
    type: String,
  })
  @Column('text', { nullable: true })
  details?: string;

  @ApiProperty({
    type: Attachment,
    description: 'Category image',
    required: false,
  })
  @Column('json', { nullable: true })
  image?: Attachment;

  @ApiProperty({ 
    description: 'Category icon', 
    required: false,
    type: String,
  })
  @Column({ nullable: true })
  icon?: string;

  @ApiProperty({ 
    description: 'Type ID', 
    example: 1,
    type: Number,
  })
  @Column()
  type_id: number;

  @ApiProperty({ 
    description: 'Language code', 
    default: 'en',
    type: String,
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
    description: 'Products count', 
    required: false,
    type: Number,
    example: 42,
  })
  products_count?: number;

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