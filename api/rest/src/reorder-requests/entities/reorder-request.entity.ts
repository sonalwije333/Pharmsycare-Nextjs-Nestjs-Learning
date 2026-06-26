import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';

export enum ReorderRequestStatus {
  PENDING = 'pending',
  NOTIFIED = 'submitted',
  ACKNOWLEDGED = 'confirmed',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

export enum ReorderNotificationChannel {
  EMAIL = 'email',
  MESSAGE = 'message',
  BOTH = 'both',
}

@Entity('reorder_requests')
export class ReorderRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column()
  product_name: string;

  @Column({ nullable: true })
  sku: string | null;

  @Column({ nullable: true })
  shop_id: number | null;

  @Column()
  supplier_id: number;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'quantity_requested' })
  requested_quantity: number;

  @Column({ name: 'current_stock' })
  current_stock: number;

  @Column({ name: 'current_quantity' })
  current_quantity: number;

  @Column({ default: true })
  is_automated: boolean;

  @Column({ nullable: true })
  created_by: number | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: ReorderRequestStatus,
    default: ReorderRequestStatus.PENDING,
  })
  status: ReorderRequestStatus;

  @Column({
    type: 'enum',
    enum: ReorderNotificationChannel,
    default: ReorderNotificationChannel.BOTH,
  })
  notification_channel: ReorderNotificationChannel;

  @Column({ nullable: true, type: 'text' })
  notification_message: string | null;

  @Column({ nullable: true, type: 'text' })
  email_delivery_log: string | null;

  @Column({ nullable: true, type: 'text' })
  contact_message_log: string | null;

  @Column({ nullable: true })
  notified_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
