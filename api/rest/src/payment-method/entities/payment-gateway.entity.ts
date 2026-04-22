// payment-method/entities/payment-gateway.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity('payment_gateways')
export class PaymentGateWay extends CoreEntity {
  @ApiProperty()
  @Column('int')
  user_id: number;

  @ApiProperty()
  @Column({ nullable: true })
  customer_id: string;

  @ApiProperty()
  @Column({ unique: true })
  gateway_name: string;
}