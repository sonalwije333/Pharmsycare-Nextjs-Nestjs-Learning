// payment/entities/stripe.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

export enum StripePaymentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_ACTION = 'requires_action',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

export enum StripePaymentMethodType {
  CARD = 'card',
  IDEAL = 'ideal',
  SOFORT = 'sofort',
  SEPA_DEBIT = 'sepa_debit',
  BANCONTACT = 'bancontact',
  EPS = 'eps',
  GIROPAY = 'giropay',
  P24 = 'p24'
}

@Entity('stripe_payments')
export class StripePayment {
  @ApiProperty({ description: 'Payment ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Stripe payment intent ID', example: 'pi_123456789' })
  @Column({ unique: true })
  stripe_payment_intent_id: string;

  @ApiProperty({ description: 'Stripe customer ID', example: 'cus_123456789' })
  @Column({ nullable: true })
  stripe_customer_id: string;

  @ApiProperty({ description: 'Payment amount', example: 1000 })
  @Column('int')
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'usd' })
  @Column({ length: 3 })
  currency: string;

  @ApiProperty({ 
    enum: StripePaymentStatus, 
    description: 'Payment status'
  })
  @Column({
    type: 'enum',
    enum: StripePaymentStatus,
    default: StripePaymentStatus.REQUIRES_PAYMENT_METHOD
  })
  status: StripePaymentStatus;

  @ApiProperty({ description: 'Payment method type', enum: StripePaymentMethodType })
  @Column({
    type: 'enum',
    enum: StripePaymentMethodType,
    nullable: true
  })
  payment_method_type: StripePaymentMethodType;

  @ApiProperty({ description: 'Stripe payment method ID' })
  @Column({ nullable: true })
  payment_method_id: string;

  @ApiProperty({ description: 'Client secret for frontend confirmation' })
  @Column({ nullable: true })
  client_secret: string;

  @ApiProperty({ description: 'User ID who made the payment' })
  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Payment description' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'Stripe receipt URL' })
  @Column({ nullable: true })
  receipt_url: string;

  @ApiProperty({ description: 'Stripe invoice ID' })
  @Column({ nullable: true })
  invoice_id: string;

  @ApiProperty({ description: 'Payment failure message' })
  @Column({ nullable: true })
  failure_message: string;

  @ApiProperty({ description: 'Payment failure code' })
  @Column({ nullable: true })
  failure_code: string;

  @ApiProperty({ description: 'Payment method details' })
  @Column('json', { nullable: true })
  payment_method_details: any;

  @ApiProperty({ description: 'Stripe charge ID' })
  @Column({ nullable: true })
  charge_id: string;

  @ApiProperty({ description: 'Refund ID' })
  @Column({ nullable: true })
  refund_id: string;

  @ApiProperty({ description: 'Refund amount' })
  @Column('int', { nullable: true })
  refund_amount: number;

  @ApiProperty({ description: 'Refund reason' })
  @Column({ nullable: true })
  refund_reason: string;

  @ApiProperty({ description: 'Payment completion timestamp' })
  @Column({ nullable: true })
  succeeded_at: Date;

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

@Entity('stripe_customers')
export class StripeCustomer {
  @ApiProperty({ description: 'Customer ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Stripe customer ID', example: 'cus_123456789' })
  @Column({ unique: true })
  stripe_customer_id: string;

  @ApiProperty({ description: 'User ID' })
  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Customer email' })
  @Column()
  email: string;

  @ApiProperty({ description: 'Customer name' })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ description: 'Default payment method ID' })
  @Column({ nullable: true })
  default_payment_method: string;

  @ApiProperty({ description: 'Customer metadata' })
  @Column('json', { nullable: true })
  metadata: any;

  @ApiProperty({ description: 'Is customer deleted in Stripe' })
  @Column({ default: false })
  is_deleted: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('stripe_refunds')
export class StripeRefund {
  @ApiProperty({ description: 'Refund ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Stripe refund ID', example: 're_123456789' })
  @Column({ unique: true })
  stripe_refund_id: string;

  @ApiProperty({ description: 'Stripe payment ID' })
  @Column()
  stripe_payment_id: number;

  @ManyToOne(() => StripePayment)
  @JoinColumn({ name: 'stripe_payment_id' })
  payment: StripePayment;

  @ApiProperty({ description: 'Refund amount' })
  @Column('int')
  amount: number;

  @ApiProperty({ description: 'Refund reason' })
  @Column({ nullable: true })
  reason: string;

  @ApiProperty({ description: 'Refund status' })
  @Column({ default: 'pending' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}