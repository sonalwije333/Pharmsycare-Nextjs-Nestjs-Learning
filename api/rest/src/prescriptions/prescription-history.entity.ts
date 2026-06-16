import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { Prescription, PrescriptionStatus } from './prescription.entity';

export enum PrescriptionHistoryAction {
  UPLOADED = 'uploaded',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
  STATUS_CHANGED = 'status_changed',
  ASSIGNED_SHOP = 'assigned_shop',
  NOTES_UPDATED = 'notes_updated',
}

@Entity('prescription_history')
export class PrescriptionHistory {
  @ApiProperty({ description: 'History entry ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Prescription ID', example: 1 })
  @Column()
  prescription_id: number;

  @ManyToOne(() => Prescription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @ApiProperty({ enum: PrescriptionHistoryAction })
  @Column({ type: 'enum', enum: PrescriptionHistoryAction })
  action: PrescriptionHistoryAction;

  @ApiProperty({ enum: PrescriptionStatus, required: false })
  @Column({ type: 'enum', enum: PrescriptionStatus, nullable: true })
  from_status: PrescriptionStatus | null;

  @ApiProperty({ enum: PrescriptionStatus, required: false })
  @Column({ type: 'enum', enum: PrescriptionStatus, nullable: true })
  to_status: PrescriptionStatus | null;

  @ApiProperty({ description: 'Additional notes for this event', required: false })
  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @ApiProperty({ description: 'User ID who performed the action', required: false })
  @Column({ nullable: true })
  performed_by: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performed_by' })
  performer: User | null;

  @ApiProperty({ description: 'Shop ID related to this event', required: false })
  @Column({ nullable: true })
  shop_id: number | null;

  @ApiProperty({ description: 'Event timestamp' })
  @CreateDateColumn()
  created_at: Date;
}
