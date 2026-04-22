// refunds/entities/refund.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { RefundPolicy } from 'src/refund-policies/entities/refund-policies.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';


export enum RefundStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  PROCESSING = 'Processing',
}

@Entity('refunds')
export class Refund extends CoreEntity {
  @ApiProperty({ description: 'Refund ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Refund amount', example: 99.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Refund status',
    enum: RefundStatus,
    example: RefundStatus.PENDING
  })
  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.PENDING })
  status: RefundStatus;

  @ApiProperty({ type: () => Shop, description: 'Associated shop' })
  @ManyToOne(() => Shop, shop => shop.refunds)
  shop: Shop;

  @ApiProperty({ type: () => Order, description: 'Associated order' })
  @ManyToOne(() => Order, order => order.refunds)
  order: Order;

  @ApiProperty({ type: () => User, description: 'Customer who requested refund' })
  @ManyToOne(() => User, user => user.refunds)
  customer: User;

  @ApiProperty({ type: () => RefundPolicy, description: 'Associated refund policy', required: false })
  @ManyToOne(() => RefundPolicy, (policy) => policy.refunds, { nullable: true })
  @JoinColumn({ name: 'refund_policy_id' })
  refund_policy?: RefundPolicy;

  @ApiProperty({ description: 'Order ID', example: 1 })
  @Column()
  order_id: number;

  @ApiProperty({ description: 'Customer ID', example: 1 })
  @Column()
  customer_id: number;

  @ApiProperty({ description: 'Refund policy ID', example: 1, required: false })
  @Column({ nullable: true })
  refund_policy_id?: number;

  @ApiProperty({ description: 'Shop ID', required: false })
  @Column({ nullable: true })
  shop_id?: number;

  @ApiProperty({ description: 'Refund reason', required: false })
  @Column({ nullable: true })
  reason?: string;

  @ApiProperty({ description: 'Admin notes', required: false })
  @Column({ nullable: true })
  admin_notes?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}