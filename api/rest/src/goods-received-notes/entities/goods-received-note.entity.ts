import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { GrnItem } from './goods-received-note-item.entity';

export enum GrnStatus {
  DRAFT = 'draft',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity('goods_received_notes')
export class GoodsReceivedNote {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Index()
  @Column()
  grn_number: string;

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

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  reorder_request_id: number | null;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  invoice_number: string | null;

  @ApiProperty({ enum: GrnStatus })
  @Column({ type: 'enum', enum: GrnStatus, default: GrnStatus.DRAFT })
  status: GrnStatus;

  @ApiProperty({ required: false })
  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  received_by: number | null;

  @ApiProperty({ required: false })
  @Column({ type: 'datetime', nullable: true })
  received_at: Date | null;

  @ApiProperty()
  @Column({ default: 0 })
  total_quantity: number;

  @ApiProperty({ required: false })
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  total_cost: number | null;

  @OneToMany(() => GrnItem, (item) => item.grn, {
    cascade: true,
    eager: true,
  })
  items: GrnItem[];

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
