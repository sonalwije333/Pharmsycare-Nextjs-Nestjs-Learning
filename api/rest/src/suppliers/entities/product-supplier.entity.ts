import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Supplier } from './supplier.entity';

@Entity('product_suppliers')
@Unique(['product_id'])
export class ProductSupplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column()
  supplier_id: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.product_mappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ default: 50 })
  reorder_quantity: number;

  @CreateDateColumn()
  created_at: Date;
}
