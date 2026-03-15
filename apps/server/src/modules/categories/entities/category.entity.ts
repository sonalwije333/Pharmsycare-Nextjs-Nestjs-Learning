import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { Type } from '../../types/entities/type.entity';
import { Product } from '../../products/entities/product.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('categories')
export class Category extends CoreEntity {
  @ApiProperty({ description: 'Category name', example: 'Baby Care' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Category slug', example: 'baby-care' })
  @Column({ unique: true })
  slug: string;

  @ApiPropertyOptional({
    description: 'Category details',
    example: 'All baby care products',
  })
  @Column({ type: 'text', nullable: true })
  details?: string;

  @ApiPropertyOptional({ description: 'Category icon', example: 'baby-icon' })
  @Column({ nullable: true })
  icon?: string;

  @ApiProperty({
    description: 'Category language',
    example: 'en',
    default: 'en',
  })
  @Column({ default: 'en' })
  language: string;

  @ApiPropertyOptional({
    description: 'Translated languages',
    type: [String],
    example: ['en', 'es'],
  })
  @Column('simple-array', { nullable: true })
  translated_languages?: string[];

  @ApiProperty({ description: 'Products count', example: 25, default: 0 })
  @Column({ default: 0 })
  products_count?: number;

  @ApiProperty({ description: 'Is approved', example: false, default: false })
  @Column({ default: false })
  is_approved?: boolean;

  // Self-referencing relationship for parent category
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  // Relationship with Type
  @ManyToOne(() => Type, (type) => type.categories, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'type_id' })
  type?: Type;

  // Relationship with Products
  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];

  // Image relationships
  @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  image?: Attachment;

  @ManyToMany(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinTable()
  banners?: Attachment[];

  @ManyToMany(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinTable()
  promotional_sliders?: Attachment[];
}
