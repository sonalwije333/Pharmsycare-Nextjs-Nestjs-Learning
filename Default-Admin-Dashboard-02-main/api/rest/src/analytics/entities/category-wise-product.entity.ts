// analytics/entities/category-wise-product.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity('category_wise_products')
export class CategoryWiseProduct extends CoreEntity {
  @ApiProperty({ required: false })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalRevenue?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  category_id?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  category_name?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  shop_name?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  product_count?: number;
}
