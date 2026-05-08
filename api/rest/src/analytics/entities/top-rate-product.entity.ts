import { ApiProperty } from '@nestjs/swagger';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('top_rate_products')
export class TopRateProduct extends CoreEntity {
  @ApiProperty({ required: false, type: Number, description: 'Product ID', example: 1 })
  @Column({ type: 'int', nullable: true })
  product_id?: number;

  @ApiProperty({ required: false, type: String, description: 'Product name', example: 'Wireless Mouse' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @ApiProperty({ required: false, type: String, description: 'Product slug', example: 'wireless-mouse' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  slug?: string;

  @ApiProperty({ required: false, type: Number, description: 'Regular price', example: 49.99 })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  regular_price?: number;

  @ApiProperty({ required: false, type: Number, description: 'Sale price', example: 39.99 })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  sale_price?: number;

  @ApiProperty({ required: false, type: Number, description: 'Minimum price', example: 39.99 })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  min_price?: number;

  @ApiProperty({ required: false, type: Number, description: 'Maximum price', example: 49.99 })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_price?: number;

  @ApiProperty({ required: false, type: String, description: 'Product type', example: 'simple' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  product_type?: string;

  @ApiProperty({ required: false, type: String, description: 'Product description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ required: false, type: Number, description: 'Type ID', example: 1 })
  @Column({ type: 'int', nullable: true })
  type_id?: number;

  @ApiProperty({ required: false, type: String, description: 'Type slug', example: 'electronics' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  type_slug?: string;

  @ApiProperty({ required: false, type: Number, description: 'Total rating', example: 4.5 })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  total_rating?: number;

  @ApiProperty({ required: false, type: Number, description: 'Rating count', example: 128 })
  @Column({ type: 'int', nullable: true })
  rating_count?: number;

  @ApiProperty({ required: false, type: Number, description: 'Actual rating', example: 4.5 })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  actual_rating?: number;

  @ApiProperty({ type: () => Attachment, required: false, description: 'Product image' })
  @Column({ type: 'json', nullable: true })
  image?: Attachment;

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