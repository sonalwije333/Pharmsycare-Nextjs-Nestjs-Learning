// flash-sale/entities/flash-sale.entity.ts
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

// Comment out Product import for now
// import { Product } from '../../products/entities/product.entity';

@Entity('flash_sales')
export class FlashSale extends CoreEntity {
  @ApiProperty({ description: 'Flash sale ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Flash sale title',
    example: 'Limited-Time Offer: Act Fast!',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Flash sale slug',
    example: 'limited-time-offer-act-fast',
  })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    description: 'Flash sale description',
    example: "Don't miss out on our incredible...",
  })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'Start date', example: '2023-10-31 06:49:59' })
  @Column()
  start_date: string;

  @ApiProperty({ description: 'End date', example: '2024-11-29 18:00:00' })
  @Column()
  end_date: string;

  @ApiProperty({
    type: Attachment,
    description: 'Flash sale image',
    required: false,
  })
  @Column('json', { nullable: true })
  image?: Attachment;

  @ApiProperty({
    type: Attachment,
    description: 'Cover image',
    required: false,
  })
  @Column('json', { nullable: true })
  cover_image?: Attachment;

  @ApiProperty({ description: 'Flash sale type', example: 'percentage' })
  @Column()
  type: string;

  @ApiProperty({ description: 'Discount rate', example: '50' })
  @Column()
  rate: string;

  @ApiProperty({ description: 'Sale status', example: true })
  @Column({ default: true })
  sale_status: boolean;

  @ApiProperty({ description: 'Sale builder configuration', required: false })
  @Column('json', { nullable: true })
  sale_builder?: any;

  @ApiProperty({ description: 'Language code', default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Translated languages', type: [String] })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  // Comment out products relation for now
  // @ApiProperty({ type: () => [Product], description: 'Products in flash sale' })
  // @ManyToMany(() => Product)
  // @JoinTable()
  // products: Product[];

  @ApiProperty({ description: 'Product IDs', type: [Number], required: false })
  @Column('simple-array', { nullable: true })
  product_ids?: number[];

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
