import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class PaymentGateWay extends CoreEntity {
  @Column()
  user_id: number;

  @Column()
  customer_id: string;

  @Column()
  gateway_name: string;
}