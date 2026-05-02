// payment-method/entities/payment-method.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { PaymentGateWay } from './payment-gateway.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('payment_methods')
export class PaymentMethod extends CoreEntity {
  @ApiProperty({ description: 'Payment method key', example: 'pm_123456789' })
  @Column({ unique: true })
  method_key: string;

  @ApiProperty({ description: 'Is default card', example: false })
  @Column({ default: false })
  default_card: boolean;

  @ApiProperty({ description: 'Payment gateway ID', required: false })
  @Column('int', { nullable: true })
  payment_gateway_id?: number;

  @ApiProperty({ description: 'Card fingerprint', required: false })
  @Column({ nullable: true })
  fingerprint?: string;

  @ApiProperty({ description: 'Card owner name', required: false })
  @Column({ nullable: true })
  owner_name?: string;

  @ApiProperty({ description: 'Card network', example: 'visa', required: false })
  @Column({ nullable: true })
  network?: string;

  @ApiProperty({ description: 'Card type', example: 'credit', required: false })
  @Column({ nullable: true })
  type?: string;

  @ApiProperty({ description: 'Last 4 digits', example: '4242', required: false })
  @Column({ nullable: true })
  last4?: string;

  @ApiProperty({ description: 'Expiry date', example: '12/2025', required: false })
  @Column({ nullable: true })
  expires?: string;

  @ApiProperty({ description: 'Card origin country', example: 'US', required: false })
  @Column({ nullable: true })
  origin?: string;

  @ApiProperty({ description: 'Verification check', required: false })
  @Column({ nullable: true })
  verification_check?: string;

  @ApiProperty({ description: 'Payment gateways', type: () => PaymentGateWay, required: false })
  @ManyToOne(() => PaymentGateWay, { nullable: true })
  @JoinColumn({ name: 'payment_gateway_id' })
  payment_gateways?: PaymentGateWay;
}