import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, DeleteDateColumn } from 'typeorm';

@Entity('payment_gateways')
export class PaymentGateway extends CoreEntity {
  @ApiProperty({ description: 'User ID', type: Number })
  @Column('int')
  user_id: number;

  @ApiProperty({ description: 'Customer ID', type: String })
  @Column({ nullable: true })
  customer_id: string;

  @ApiProperty({ description: 'Gateway name', type: String })
  @Column({ unique: true })
  gateway_name: string;

  @ApiProperty({ description: 'Display name', type: String })
  @Column({ nullable: true })
  display_name: string;

  @ApiProperty({ description: 'Description', type: String })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'Is active', type: Boolean, default: true })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;
}