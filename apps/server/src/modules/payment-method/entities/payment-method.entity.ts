import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentGateWay } from './payment-gateway.entity';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@Entity()
export class PaymentMethod extends CoreEntity {
  @Column()
  @IsNotEmpty()
  @IsString()
  method_key: string;

  @Column({ default: false })
  @IsOptional()
  @IsBoolean()
  default_card?: boolean;

  @Column({ nullable: true })
  payment_gateway_id?: number;

  @Column({ nullable: true })
  fingerprint?: string;

  @Column({ nullable: true })
  owner_name?: string;

  @Column({ nullable: true })
  network?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  last4?: string;

  @Column({ nullable: true })
  expires?: string;

  @Column({ nullable: true })
  origin?: string;

  @Column({ nullable: true })
  verification_check?: string;

  @ManyToOne(() => PaymentGateWay, { nullable: true })
  @JoinColumn({ name: 'payment_gateway_id' })
  payment_gateways?: PaymentGateWay;
}