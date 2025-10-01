import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity } from 'typeorm';

// Define PaymentIntentInfo FIRST
export class PaymentIntentInfo {
  client_secret?: string | null;
  redirect_url?: string | null;
  payment_id: string;
  is_redirect: boolean;
}

// Then define PaymentIntent that uses it
@Entity()
export class PaymentIntent extends CoreEntity {
  @Column()
  order_id: number;

  @Column()
  tracking_number: string;

  @Column()
  payment_gateway: string;

  @Column('json')
  payment_intent_info: PaymentIntentInfo;
}