import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Branch } from './branch.entity';

// Per-branch stock record for a catalogue product. The same medicine can exist
// in several branches with independent quantities, which powers cross-branch
// availability and centralized inventory views.
@Entity('branch_inventory')
@Unique(['branch_id', 'product_id'])
export class BranchInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  branch_id: number;

  @ManyToOne(() => Branch, (branch) => branch.inventory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column()
  product_id: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  // Threshold below which the branch is considered low on this product.
  @Column({ type: 'int', default: 10 })
  reorder_level: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number | null;

  // Denormalised product fields for fast listing / resilience.
  @Column({ nullable: true })
  product_name: string | null;

  @Column({ nullable: true })
  product_sku: string | null;

  @Column({ nullable: true })
  product_slug: string | null;

  @Column('json', { nullable: true })
  product_image: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
