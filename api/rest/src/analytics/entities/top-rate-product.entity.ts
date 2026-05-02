// analytics/entities/top-rate-product.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity('top_rate_products')
export class TopRateProduct extends CoreEntity {
  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  product_id?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  slug?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  regular_price?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  sale_price?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  min_price?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_price?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  product_type?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  type_id?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 100, nullable: true })
  type_slug?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  total_rating?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  rating_count?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  actual_rating?: number;

  @ApiProperty({ type: Attachment, required: false })
  @Column({ type: 'json', nullable: true })
  image?: Attachment;
}
