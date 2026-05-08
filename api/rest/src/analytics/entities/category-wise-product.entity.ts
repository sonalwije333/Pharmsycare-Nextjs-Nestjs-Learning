import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity('category_wise_products')
export class CategoryWiseProduct extends CoreEntity {
  @ApiProperty({ required: false, type: Number, description: 'Total revenue for category', example: 5000.0 })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalRevenue?: number;

  @ApiProperty({ required: false, type: Number, description: 'Category ID', example: 1 })
  @Column({ type: 'int', nullable: true })
  category_id?: number;

  @ApiProperty({ required: false, type: String, description: 'Category name', example: 'Electronics' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  category_name?: string;

  @ApiProperty({ required: false, type: String, description: 'Shop name', example: 'Tech Store' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  shop_name?: string;

  @ApiProperty({ required: false, type: Number, description: 'Product count in category', example: 25 })
  @Column({ type: 'int', nullable: true })
  product_count?: number;

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