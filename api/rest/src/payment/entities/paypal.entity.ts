// payment/entities/paypal.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

export enum PayPalPaymentStatus {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PayPalPaymentIntent {
  CAPTURE = 'CAPTURE',
  AUTHORIZE = 'AUTHORIZE'
}

@Entity('paypal_payments')
export class PayPalPayment {
  @ApiProperty({ description: 'Payment ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'PayPal order ID', example: 'PAYID-XXXXXXXXXXXX' })
  @Column({ unique: true })
  paypal_order_id: string;

  @ApiProperty({ description: 'Invoice ID', example: 'INV-001' })
  @Column()
  invoice_id: string;

  @ApiProperty({ description: 'Payment amount', example: 100.50 })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @Column({ length: 3 })
  currency_code: string;

  @ApiProperty({ description: 'Payment description', example: 'Order payment' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ 
    enum: PayPalPaymentStatus, 
    description: 'Payment status',
    default: PayPalPaymentStatus.CREATED
  })
  @Column({
    type: 'enum',
    enum: PayPalPaymentStatus,
    default: PayPalPaymentStatus.CREATED
  })
  status: PayPalPaymentStatus;

  @ApiProperty({ 
    enum: PayPalPaymentIntent, 
    description: 'Payment intent',
    default: PayPalPaymentIntent.CAPTURE
  })
  @Column({
    type: 'enum',
    enum: PayPalPaymentIntent,
    default: PayPalPaymentIntent.CAPTURE
  })
  intent: PayPalPaymentIntent;

  @ApiProperty({ description: 'PayPal approval URL' })
  @Column({ nullable: true })
  approval_url: string;

  @ApiProperty({ description: 'PayPal cancel URL' })
  @Column({ nullable: true })
  cancel_url: string;

  @ApiProperty({ description: 'PayPal return URL' })
  @Column({ nullable: true })
  return_url: string;

  @ApiProperty({ description: 'PayPal payer ID' })
  @Column({ nullable: true })
  payer_id: string;

  @ApiProperty({ description: 'PayPal payment source' })
  @Column('json', { nullable: true })
  payment_source: any;

  @ApiProperty({ description: 'PayPal links' })
  @Column('json', { nullable: true })
  links: any[];

  @ApiProperty({ description: 'User ID who made the payment' })
  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Payment failure reason' })
  @Column({ nullable: true })
  failure_reason: string;

  @ApiProperty({ description: 'PayPal capture ID' })
  @Column({ nullable: true })
  capture_id: string;

  @ApiProperty({ description: 'PayPal refund ID' })
  @Column({ nullable: true })
  refund_id: string;

  @ApiProperty({ description: 'Refund amount' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refund_amount: number;

  @ApiProperty({ description: 'Payment completion timestamp' })
  @Column({ nullable: true })
  completed_at: Date;

  @ApiProperty({ description: 'Refund timestamp' })
  @Column({ nullable: true })
  refunded_at: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('paypal_refunds')
export class PayPalRefund {
  @ApiProperty({ description: 'Refund ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'PayPal refund ID' })
  @Column({ unique: true })
  paypal_refund_id: string;

  @ApiProperty({ description: 'PayPal payment ID' })
  @Column()
  paypal_payment_id: number;

  @ManyToOne(() => PayPalPayment)
  @JoinColumn({ name: 'paypal_payment_id' })
  payment: PayPalPayment;

  @ApiProperty({ description: 'Refund amount' })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Refund reason' })
  @Column({ nullable: true })
  reason: string;

  @ApiProperty({ description: 'Refund status' })
  @Column({ default: 'PENDING' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}