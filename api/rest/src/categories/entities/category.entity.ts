import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { Product } from 'src/products/entities/product.entity';
import { Type } from 'src/types/entities/type.entity';
@Entity('categories')
export class Category extends CoreEntity {
  @ApiProperty({ description: 'Category ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Category name', example: 'Fruits & Vegetables' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Category slug', example: 'fruits-vegetables' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    type: () => Category,
    description: 'Parent category',
    required: false,
  })
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @ApiProperty({ description: 'Parent category ID', required: false })
  @Column({ nullable: true })
  parent_id?: number;

  @ApiProperty({
    type: () => [Category],
    description: 'Child categories',
    required: false,
  })
  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  @ApiProperty({ description: 'Category details', required: false })
  @Column('text', { nullable: true })
  details?: string;

  @ApiProperty({
    type: Attachment,
    description: 'Category image',
    required: false,
  })
  @Column('json', { nullable: true })
  image?: Attachment;

  @ApiProperty({ description: 'Category icon', required: false })
  @Column({ nullable: true })
  icon?: string;


  @ApiProperty({ type: () => Type, description: 'Category type' })
  @ManyToOne(() => Type)
  @JoinColumn({ name: 'type_id' })
  type?: Type;

  @ApiProperty({ description: 'Type ID', example: 1 })
  @Column()
  type_id: number;


  @ApiProperty({
    type: () => [Product],
    description: 'Products in this category',
  })
  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];

  @ApiProperty({ description: 'Language code', default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Translated languages', type: [String] })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ApiProperty({ description: 'Products count', required: false })
  products_count?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
