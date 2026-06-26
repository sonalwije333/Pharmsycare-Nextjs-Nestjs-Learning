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
  CREATED = 'created',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  STATUS_UPDATED = 'status_updated',
  NOTES_UPDATED = 'notes_updated',
  SHOP_ASSIGNED = 'shop_assigned',
}

@Entity('prescription_history')
export class PrescriptionHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  prescription_id: number;

  @ManyToOne(() => Prescription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @ApiProperty({ enum: PrescriptionStatus, required: false })
  @Column({ type: 'enum', enum: PrescriptionStatus, nullable: true })
  from_status: PrescriptionStatus | null;

  @ApiProperty({ enum: PrescriptionStatus })
  @Column({ type: 'enum', enum: PrescriptionStatus })
  to_status: PrescriptionStatus;

  @ApiProperty({ enum: PrescriptionHistoryAction })
  @Column({ type: 'enum', enum: PrescriptionHistoryAction })
  action: PrescriptionHistoryAction;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  performed_by: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @ApiProperty({ required: false })
  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  shop_id: number | null;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
