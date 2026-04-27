// prescriptions/entities/prescription.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';

export enum PrescriptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('prescriptions')
export class Prescription extends CoreEntity {
  @ApiProperty({ description: 'Customer ID', example: 1 })
  @Column({ type: 'int', nullable: false })
  customer_id: number;

  @ApiProperty({ description: 'Shop ID', example: 1 })
  @Column({ type: 'int', nullable: false })
  shop_id: number;

  @ApiProperty({ description: 'Prescription file URL', example: 'https://example.com/prescription.pdf' })
  @Column({ type: 'varchar', nullable: false })
  prescription_file: string;

  @ApiProperty({ description: 'Prescription status', enum: PrescriptionStatus, default: PrescriptionStatus.PENDING })
  @Column({ type: 'varchar', default: PrescriptionStatus.PENDING })
  status: PrescriptionStatus;

  @ApiProperty({ description: 'Doctor name', example: 'Dr. John Doe' })
  @Column({ type: 'varchar', nullable: true })
  doctor_name: string;

  @ApiProperty({ description: 'Hospital name', example: 'City Hospital' })
  @Column({ type: 'varchar', nullable: true })
  hospital_name: string;

  @ApiProperty({ description: 'Prescription date', example: '2024-01-15' })
  @Column({ type: 'date', nullable: true })
  prescription_date: Date;

  @ApiProperty({ description: 'Expiry date', example: '2024-03-15' })
  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @ApiProperty({ description: 'Admin notes', example: 'Prescription verified' })
  @Column({ type: 'text', nullable: true })
  admin_notes: string;

  @ApiProperty({ description: 'Customer notes', example: 'Urgent prescription' })
  @Column({ type: 'text', nullable: true })
  customer_notes: string;

  @ApiProperty({ description: 'Approved/Rejected by (staff ID)', example: 1 })
  @Column({ type: 'int', nullable: true })
  approved_by: number;

  @ApiProperty({ description: 'Approval timestamp' })
  @Column({ type: 'datetime', nullable: true })
  approved_at: Date;

  @ApiProperty({ description: 'Customer relation', type: () => User })
  customer?: User;

  @ApiProperty({ description: 'Shop relation', type: () => Shop })
  shop?: Shop;

  @ApiProperty({ description: 'Approved by user relation', type: () => User })
  approved_by_user?: User;
}
