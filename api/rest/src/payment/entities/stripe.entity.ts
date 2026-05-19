import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { StripePaymentStatus, StripePaymentMethodType } from 'src/common/enums/payment.enum';


@Entity('stripe_payments')
export class StripePayment {
  @ApiProperty({ description: 'Payment ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Stripe payment intent ID', example: 'pi_123456789', type: String })
  @Column({ unique: true })
  stripe_payment_intent_id: string;

  @ApiProperty({ description: 'Stripe customer ID', example: 'cus_123456789', type: String })
  @Column({ nullable: true })
  stripe_customer_id: string;

  @ApiProperty({ description: 'Payment amount', example: 1000, type: Number })
  @Column('int')
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'usd', type: String })
  @Column({ length: 3 })
  currency: string;

  @ApiProperty({ enum: StripePaymentStatus, description: 'Payment status' })
  @Column({ type: 'varchar' })
  status: StripePaymentStatus;

  @ApiProperty({ enum: StripePaymentMethodType, description: 'Payment method type' })
  @Column({ type: 'varchar', nullable: true })
  payment_method_type: StripePaymentMethodType;

  @ApiProperty({ description: 'Stripe payment method ID', type: String })
  @Column({ nullable: true })
  payment_method_id: string;

  @ApiProperty({ description: 'Client secret for frontend confirmation', type: String })
  @Column({ nullable: true })
  client_secret: string;

  @ApiProperty({ description: 'User ID', type: Number })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Payment description', type: String })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'Stripe receipt URL', type: String })
  @Column({ nullable: true })
  receipt_url: string;

  @ApiProperty({ description: 'Stripe invoice ID', type: String })
  @Column({ nullable: true })
  invoice_id: string;

  @ApiProperty({ description: 'Payment failure message', type: String })
  @Column({ nullable: true })
  failure_message: string;

  @ApiProperty({ description: 'Payment failure code', type: String })
  @Column({ nullable: true })
  failure_code: string;

  @ApiProperty({ description: 'Payment method details', type: Object })
  @Column('json', { nullable: true })
  payment_method_details: any;

  @ApiProperty({ description: 'Stripe charge ID', type: String })
  @Column({ nullable: true })
  charge_id: string;

  @ApiProperty({ description: 'Refund ID', type: String })
  @Column({ nullable: true })
  refund_id: string;

  @ApiProperty({ description: 'Refund amount', type: Number })
  @Column('int', { nullable: true })
  refund_amount: number;

  @ApiProperty({ description: 'Refund reason', type: String })
  @Column({ nullable: true })
  refund_reason: string;

  @ApiProperty({ description: 'Payment completion timestamp', type: Date })
  @Column({ nullable: true })
  succeeded_at: Date;

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

@Entity('stripe_customers')
export class StripeCustomer {
  @ApiProperty({ description: 'Customer ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Stripe customer ID', example: 'cus_123456789', type: String })
  @Column({ unique: true })
  stripe_customer_id: string;

  @ApiProperty({ description: 'User ID', type: Number })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Customer email', type: String })
  @Column()
  email: string;

  @ApiProperty({ description: 'Customer name', type: String })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ description: 'Default payment method ID', type: String })
  @Column({ nullable: true })
  default_payment_method: string;

  @ApiProperty({ description: 'Customer metadata', type: Object })
  @Column('json', { nullable: true })
  metadata: any;

  @ApiProperty({ description: 'Is customer deleted in Stripe', type: Boolean, default: false })
  @Column({ default: false })
  is_deleted: boolean;

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

@Entity('stripe_refunds')
export class StripeRefund {
  @ApiProperty({ description: 'Refund ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Stripe refund ID', example: 're_123456789', type: String })
  @Column({ unique: true })
  stripe_refund_id: string;

  @ApiProperty({ description: 'Stripe payment ID', type: Number })
  @Column()
  stripe_payment_id: number;

  @ApiProperty({ description: 'Refund amount', type: Number })
  @Column('int')
  amount: number;

  @ApiProperty({ description: 'Refund reason', type: String })
  @Column({ nullable: true })
  reason: string;

  @ApiProperty({ description: 'Refund status', type: String, default: 'pending' })
  @Column({ default: 'pending' })
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