import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductShelfLocation } from './product-shelf-location.entity';

@Entity('shelf_locations')
export class ShelfLocation {
  @PrimaryGeneratedColumn()
  id: number;

  // Human readable shelf code shown on the physical shelf, e.g. "A1", "C3-B".
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  // Logical grouping used to lay out the pharmacy floor map.
  @Column({ default: 'General' })
  zone: string;

  @Column({ nullable: true })
  aisle: string | null;

  // Grid coordinates used by the visual map renderer (0-based).
  @Column({ type: 'int', default: 0 })
  row_index: number;

  @Column({ type: 'int', default: 0 })
  column_index: number;

  // Hex colour used to tint the shelf on the visual map.
  @Column({ nullable: true })
  color: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => ProductShelfLocation, (mapping) => mapping.shelf_location)
  product_mappings: ProductShelfLocation[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
