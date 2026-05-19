import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { PaymentMethodType } from 'src/common/enums/payment-method.enum';
import { Column, Entity, DeleteDateColumn } from 'typeorm';


@Entity('payment_methods')
export class PaymentMethod extends CoreEntity {
  @ApiProperty({ description: 'Payment method key', example: 'pm_123456789', type: String })
  @Column({ unique: true })
  method_key: string;

  @ApiProperty({ description: 'Is default card', example: false, type: Boolean })
  @Column({ default: false })
  default_card: boolean;

  @ApiProperty({ description: 'Payment gateway ID', required: false, type: Number })
  @Column('int', { nullable: true })
  payment_gateway_id?: number;

  @ApiProperty({ description: 'Gateway name', type: String })
  @Column()
  gateway_name: string;

  @ApiProperty({ description: 'Card fingerprint', required: false, type: String })
  @Column({ nullable: true })
  fingerprint?: string;

  @ApiProperty({ description: 'Card owner name', required: false, type: String })
  @Column({ nullable: true })
  owner_name?: string;

  @ApiProperty({ description: 'Card network', example: 'visa', required: false, type: String })
  @Column({ nullable: true })
  network?: string;

  @ApiProperty({ description: 'Card type', enum: PaymentMethodType, required: false })
  @Column({ nullable: true })
  type?: string;

  @ApiProperty({ description: 'Last 4 digits', example: '4242', required: false, type: String })
  @Column({ nullable: true })
  last4?: string;

  @ApiProperty({ description: 'Expiry date', example: '12/2025', required: false, type: String })
  @Column({ nullable: true })
  expires?: string;

  @ApiProperty({ description: 'Card origin country', example: 'US', required: false, type: String })
  @Column({ nullable: true })
  origin?: string;

  @ApiProperty({ description: 'Verification check', required: false, type: String })
  @Column({ nullable: true })
  verification_check?: string;

  @ApiProperty({ description: 'User ID', type: Number })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Billing details', type: Object, required: false })
  @Column('json', { nullable: true })
  billing_details?: any;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;
}