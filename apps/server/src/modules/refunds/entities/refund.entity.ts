import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import {RefundStatus} from "../../../common/enums/enums";
import {Shop} from "../../shops/entites/shop.entity";



@Entity()
export class Refund extends CoreEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,
  })
  status: RefundStatus;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  refund_policy_id?: number;

  @Column({ nullable: true })
  refund_reason_id?: number;

  @Column()
  shop_id: number;

  @Column()
  order_id: number;

  @Column()
  customer_id: number;

  @ManyToOne(() => Shop, { eager: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @ManyToOne(() => Order, { eager: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ nullable: true })
  refunded_at?: Date;
}