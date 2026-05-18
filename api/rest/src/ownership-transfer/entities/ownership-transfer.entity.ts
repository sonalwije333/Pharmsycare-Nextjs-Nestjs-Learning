import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { OwnershipTransferStatus } from 'src/common/enums/ownership-transfer.enum';
import { Column, Entity, DeleteDateColumn } from 'typeorm';

export class TodayTotalOrderByStatus {
  @ApiProperty({ description: 'Pending orders count', example: 5, type: Number })
  pending: number;

  @ApiProperty({ description: 'Processing orders count', example: 3, type: Number })
  processing: number;

  @ApiProperty({ description: 'Complete orders count', example: 10, type: Number })
  complete: number;

  @ApiProperty({ description: 'Cancelled orders count', example: 2, type: Number })
  cancelled: number;

  @ApiProperty({ description: 'Refunded orders count', example: 1, type: Number })
  refunded: number;

  @ApiProperty({ description: 'Failed orders count', example: 0, type: Number })
  failed: number;

  @ApiProperty({ description: 'Local facility orders count', example: 0, type: Number })
  localFacility: number;

  @ApiProperty({ description: 'Out for delivery orders count', example: 0, type: Number })
  outForDelivery: number;
}

@Entity('ownership_transfer')
export class OwnershipTransfer extends CoreEntity {
  @ApiProperty({ description: 'Created by user ID', example: 6, type: String })
  @Column()
  created_by: string;

  @ApiProperty({ description: 'Transaction identifier', example: '2024-08-03-0001', type: String })
  @Column()
  transaction_identifier: string;

  @ApiProperty({ description: 'Previous owner ID', required: false, type: Number })
  @Column({ nullable: true })
  previous_owner_id?: number;

  @ApiProperty({ description: 'Current owner ID', required: false, type: Number })
  @Column({ nullable: true })
  current_owner_id?: number;

  @ApiProperty({ description: 'Transfer message', required: false, type: String })
  @Column({ type: 'text', nullable: true })
  message?: string;

  @ApiProperty({ description: 'Transfer status', enum: OwnershipTransferStatus, example: 'pending', type: String })
  @Column({ default: OwnershipTransferStatus.PENDING })
  status: OwnershipTransferStatus;

  @ApiProperty({ description: 'Order information', type: () => TodayTotalOrderByStatus, required: false })
  @Column('json', { nullable: true })
  order_info?: TodayTotalOrderByStatus;

  @ApiProperty({ description: 'Name', example: 'Transfer Name', required: false, type: String })
  @Column({ nullable: true })
  name?: string;

  @ApiProperty({ description: 'Balance info (JSON)', required: false, type: Object })
  @Column('json', { nullable: true })
  balance_info?: any;

  @ApiProperty({ description: 'Refund info (JSON)', required: false, type: Object })
  @Column('json', { nullable: true })
  refund_info?: any;

  @ApiProperty({ description: 'Withdrawal info (JSON)', required: false, type: Object })
  @Column('json', { nullable: true })
  withdrawal_info?: any;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;
}