import { CoreEntity } from '../../common/entities/core.entity';
import { Category } from '../../categories/entities/category.entity';
import { Product } from '../../products/entities/product.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('types')
export class Type extends CoreEntity {
  @ApiProperty({ description: 'Type name', example: 'Medicine' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Type slug', example: 'medicine' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: 'Type icon', example: 'icon-medicine' })
  @Column({ nullable: true, default: 'default_icon' })
  icon: string;

  @ApiProperty({ type: () => Attachment, description: 'Type image' })
  @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  image: Attachment;

  @ApiProperty({
    description: 'Type banners',
    type: [Object],
    example: [
      {
        id: 1,
        title: 'Summer Sale',
        description: 'Get 20% off',
        image: '/uploads/banner-1.jpg',
      },
    ],
  })
  @Column({ type: 'json', nullable: true })
  banners: any[];

  @ApiProperty({
    description: 'Promotional sliders',
    type: [Object],
    example: [
      {
        id: 1,
        title: 'New Arrivals',
        image: '/uploads/slider-1.jpg',
      },
    ],
  })
  @Column({ type: 'json', nullable: true })
  promotional_sliders: any[];

  @ApiProperty({
    description: 'Type settings',
    type: Object,
    example: {
      isHome: true,
      productCard: 'grid',
      layoutType: 'classic',
    },
  })
  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>;

  @ApiProperty({ description: 'Language', example: 'en', default: 'en' })
  @Column({ nullable: true, default: 'en' })
  language: string;

  @ApiProperty({
    description: 'Translated languages',
    example: ['en', 'es', 'fr'],
    type: [String],
  })
  @Column({ type: 'json', nullable: true })
  translated_languages: string[];

  @OneToMany(() => Category, (category) => category.type, {
    cascade: true,
  })
  categories: Category[];

  @OneToMany(() => Product, (product) => product.type)
  products: Product[];
}
