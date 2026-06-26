import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entities/shop.entity';

export enum PrescriptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FULFILLED = 'fulfilled',
  EXPIRED = 'expired',
}

export interface PrescriptionMedicine {
  product_id: number;
  name: string;
  quantity: number;
  price?: number;
  image?: string;
}

@Entity('prescriptions')
export class Prescription {
  @ApiProperty({ description: 'Prescription ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Prescription image URL', example: 'https://example.com/prescription.jpg' })
  @Column()
  image_url: string;

  @ApiProperty({ description: 'Prescription image ID from uploads', example: 'upload_123' })
  @Column()
  attachment_id: string;

  @ApiProperty({ description: 'Customer notes', example: 'Please deliver by tomorrow', required: false })
  @Column({ nullable: true, type: 'text' })
  notes: string;

  @ApiProperty({
    description: 'Medicines included with this prescription',
    required: false,
    type: 'array',
  })
  @Column({ type: 'simple-json', nullable: true })
  medicines: PrescriptionMedicine[];

  @ApiProperty({ description: 'Admin/staff notes', example: 'Approved for fulfillment', required: false })
  @Column({ nullable: true, type: 'text' })
  admin_notes: string;

  @ApiProperty({ enum: PrescriptionStatus, description: 'Prescription status', example: PrescriptionStatus.PENDING })
  @Column({ type: 'enum', enum: PrescriptionStatus, default: PrescriptionStatus.PENDING })
  status: PrescriptionStatus;

  @ApiProperty({ description: 'Customer ID', example: 1 })
  @Column()
  customer_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ApiProperty({ description: 'Shop ID', example: 1, required: false })
  @Column({ nullable: true })
  shop_id: number;

  @ManyToOne(() => Shop, { nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @ApiProperty({ description: 'Staff ID who approved/rejected', example: 2, required: false })
  @Column({ nullable: true })
  processed_by: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by' })
  processor: User;

  @ApiProperty({ description: 'Rejection reason', example: 'Prescription is illegible', required: false })
  @Column({ nullable: true, type: 'text' })
  rejection_reason: string;

  @ApiProperty({ description: 'Approved/Rejected timestamp', required: false })
  @Column({ nullable: true })
  processed_at: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}