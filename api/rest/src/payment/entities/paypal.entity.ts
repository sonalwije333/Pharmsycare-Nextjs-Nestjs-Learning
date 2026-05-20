import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PayPalPaymentIntent, PayPalPaymentStatus } from 'src/common/enums/payment.enum';


@Entity('paypal_payments')
export class PayPalPayment {
  @ApiProperty({ description: 'Payment ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'PayPal order ID', example: 'PAYID-XXXXXXXXXXXX', type: String })
  @Column({ unique: true })
  paypal_order_id: string;

  @ApiProperty({ description: 'Invoice ID', example: 'INV-001', type: String })
  @Column()
  invoice_id: string;

  @ApiProperty({ description: 'Payment amount', example: 100.50, type: Number })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD', type: String })
  @Column({ length: 3 })
  currency_code: string;

  @ApiProperty({ description: 'Payment description', example: 'Order payment', type: String })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ enum: PayPalPaymentStatus, description: 'Payment status', default: PayPalPaymentStatus.CREATED })
  @Column({ type: 'varchar', default: PayPalPaymentStatus.CREATED })
  status: PayPalPaymentStatus;

  @ApiProperty({ enum: PayPalPaymentIntent, description: 'Payment intent', default: PayPalPaymentIntent.CAPTURE })
  @Column({ type: 'varchar', default: PayPalPaymentIntent.CAPTURE })
  intent: PayPalPaymentIntent;

  @ApiProperty({ description: 'PayPal approval URL', type: String })
  @Column({ nullable: true })
  approval_url: string;

  @ApiProperty({ description: 'PayPal cancel URL', type: String })
  @Column({ nullable: true })
  cancel_url: string;

  @ApiProperty({ description: 'PayPal return URL', type: String })
  @Column({ nullable: true })
  return_url: string;

  @ApiProperty({ description: 'PayPal payer ID', type: String })
  @Column({ nullable: true })
  payer_id: string;

  @ApiProperty({ description: 'PayPal payment source', type: Object })
  @Column('json', { nullable: true })
  payment_source: any;

  @ApiProperty({ description: 'PayPal links', type: [Object] })
  @Column('json', { nullable: true })
  links: any[];

  @ApiProperty({ description: 'User ID', type: Number })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Payment failure reason', type: String })
  @Column({ nullable: true })
  failure_reason: string;

  @ApiProperty({ description: 'PayPal capture ID', type: String })
  @Column({ nullable: true })
  capture_id: string;

  @ApiProperty({ description: 'PayPal refund ID', type: String })
  @Column({ nullable: true })
  refund_id: string;

  @ApiProperty({ description: 'Refund amount', type: Number })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refund_amount: number;

  @ApiProperty({ description: 'Payment completion timestamp', type: Date })
  @Column({ nullable: true })
  completed_at: Date;

  @ApiProperty({ description: 'Refund timestamp', type: Date })
  @Column({ nullable: true })
  refunded_at: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp', type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp', type: Date })
  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('paypal_refunds')
export class PayPalRefund {
  @ApiProperty({ description: 'Refund ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'PayPal refund ID', example: '8YB12345678901234', type: String })
  @Column({ unique: true })
  paypal_refund_id: string;

  @ApiProperty({ description: 'PayPal payment ID', type: Number })
  @Column()
  paypal_payment_id: number;

  @ApiProperty({ description: 'Refund amount', type: Number })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Refund reason', type: String, required: false })
  @Column({ nullable: true })
  reason: string;

  @ApiProperty({ description: 'Refund status', type: String, default: 'succeeded' })
  @Column({ default: 'succeeded' })
  status: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp', type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp', type: Date })
  @UpdateDateColumn()
  updated_at: Date;
}