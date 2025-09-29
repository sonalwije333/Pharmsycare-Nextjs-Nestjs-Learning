import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { Product } from '../../products/entities/product.entity';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { OrderStatus } from './order-status.entity';

import { Shop } from '../../shops/entites/shop.entity';
import {
  OrderStatusType,
  PaymentGatewayType,
  PaymentStatusType,
} from '../../../common/enums/enums';
// import {PaymentIntent} from "../../payment-intent/entries/payment-intent.entity";

@Entity()
export class Order extends CoreEntity {
  @Column({ unique: true })
  tracking_number: string;

  @Column()
  customer_id: number;

  @Column()
  customer_contact: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'parent_order_id' })
  parent_order?: Order;

  @OneToMany(() => Order, order => order.parent_order)
  children: Order[];

  @ManyToOne(() => OrderStatus, { eager: true })
  @JoinColumn({ name: 'status_id' })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderStatusType,
    default: OrderStatusType.PENDING  // ✅ Now this exists
  })
  order_status: OrderStatusType;

  @Column({
    type: 'enum',
    enum: PaymentStatusType,
    default: PaymentStatusType.PENDING  // ✅ Now this exists
  })
  payment_status: PaymentStatusType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  sales_tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  paid_total: number;

  @Column({ nullable: true })
  payment_id?: string;

  @Column({ type: 'enum', enum: PaymentGatewayType })
  payment_gateway: PaymentGatewayType;

  @ManyToOne(() => Coupon, { eager: true, nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon?: Coupon;

  @ManyToOne(() => Shop, { eager: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  delivery_fee: number;

  @Column()
  delivery_time: string;

  @ManyToMany(() => Product, { eager: true })
  @JoinTable()
  products: Product[];

  @Column({ type: 'json' })
  billing_address: any;

  @Column({ type: 'json' })
  shipping_address: any;

  @Column({ default: 'en' })
  language?: string;

  @Column({ type: 'json', nullable: true })
  translated_languages?: string[];

  // @ManyToOne(() => PaymentIntent, { eager: true, nullable: true })
  // @JoinColumn({ name: 'payment_intent_id' })
  // payment_intent?: PaymentIntent;

  @Column({ nullable: true })
  altered_payment_gateway?: string;
}

@Entity()
export class OrderFiles extends CoreEntity {
  @Column()
  purchase_key: string;

  @Column()
  digital_file_id: number;

  @Column({ nullable: true })
  order_id?: number;

  @Column()
  customer_id: number;

  @Column({ type: 'json' })
  file: any;

  @Column({ type: 'json' })
  fileable: any;
}