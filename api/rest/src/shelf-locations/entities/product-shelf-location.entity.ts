import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ShelfLocation } from './shelf-location.entity';

// Maps a catalogue product (from the in-memory product dataset) to a physical
// shelf so staff can locate medicines when fulfilling a prescription.
@Entity('product_shelf_locations')
export class ProductShelfLocation {
  @PrimaryGeneratedColumn()
  id: number;

  // A product lives on exactly one shelf at a time.
  @Column({ unique: true })
  product_id: number;

  @Column()
  shelf_location_id: number;

  @ManyToOne(() => ShelfLocation, (shelf) => shelf.product_mappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shelf_location_id' })
  shelf_location: ShelfLocation;

  // Optional sub-position inside the shelf, e.g. "Bin 3" / "Row 2".
  @Column({ nullable: true })
  bin: string | null;

  // Denormalised product fields so listings stay fast and resilient even if
  // the catalogue entry changes or is filtered out.
  @Column({ nullable: true })
  product_name: string | null;

  @Column({ nullable: true })
  product_sku: string | null;

  @Column({ nullable: true })
  product_slug: string | null;

  @Column('json', { nullable: true })
  product_image: any;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
