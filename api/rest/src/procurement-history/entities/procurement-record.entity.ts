import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Supplier } from '../../suppliers/entities/supplier.entity';

export enum ProcurementStatus {
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('procurement_history')
export class ProcurementRecord {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  reorder_request_id: number | null;

  @ApiProperty()
  @Index()
  @Column()
  supplier_id: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ApiProperty()
  @Column()
  supplier_name: string;

  @ApiProperty()
  @Index()
  @Column()
  product_id: number;

  @ApiProperty()
  @Column()
  product_name: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  sku: string | null;

  @ApiProperty()
  @Column({ default: 0 })
  quantity: number;

  @ApiProperty({ required: false })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unit_cost: number | null;

  @ApiProperty({ required: false })
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  total_cost: number | null;

  @ApiProperty({ enum: ProcurementStatus })
  @Column({
    type: 'enum',
    enum: ProcurementStatus,
    default: ProcurementStatus.ORDERED,
  })
  status: ProcurementStatus;

  @ApiProperty({ required: false })
  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @ApiProperty()
  @Column({ type: 'datetime', nullable: true })
  ordered_at: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'datetime', nullable: true })
  received_at: Date | null;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
