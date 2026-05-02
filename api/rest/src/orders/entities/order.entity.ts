// orders/entities/order.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { OrderStatus } from './order-status.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { PaymentIntent } from 'src/payment-intent/entities/payment-intent.entity';
import { Refund } from 'src/refunds/entities/refund.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

export enum PaymentGatewayType {
  STRIPE = 'STRIPE',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CASH = 'CASH',
  FULL_WALLET_PAYMENT = 'FULL_WALLET_PAYMENT',
  PAYPAL = 'PAYPAL',
  RAZORPAY = 'RAZORPAY',
}

export enum OrderStatusType {
  PENDING = 'order-pending',
  PROCESSING = 'order-processing',
  COMPLETED = 'order-completed',
  CANCELLED = 'order-cancelled',
  REFUNDED = 'order-refunded',
  FAILED = 'order-failed',
  AT_LOCAL_FACILITY = 'order-at-local-facility',
  OUT_FOR_DELIVERY = 'order-out-for-delivery',
  DEFAULT_ORDER_STATUS = 'order-pending',
}

export enum PaymentStatusType {
  PENDING = 'payment-pending',
  PROCESSING = 'payment-processing',
  SUCCESS = 'payment-success',
  FAILED = 'payment-failed',
  REVERSAL = 'payment-reversal',
  CASH_ON_DELIVERY = 'payment-cash-on-delivery',
  CASH = 'payment-cash',
  WALLET = 'payment-wallet',
  AWAITING_FOR_APPROVAL = 'payment-awaiting-for-approval',
  DEFAULT_PAYMENT_STATUS = 'payment-pending',
}

@Entity('orders')
export class Order extends CoreEntity {
  @ApiProperty({ description: 'Tracking number', example: '20240207303639' })
  @Column({ type: 'varchar', nullable: true })
  tracking_number: string;

  @ApiProperty({ description: 'Customer ID', example: 2 })
  @Column({ type: 'int', nullable: true })
  customer_id: number;

  @ApiProperty({ description: 'Customer contact', example: '19365141641631' })
  @Column({ type: 'varchar', nullable: true })
  customer_contact: string;

  @ApiProperty({ description: 'Customer', type: () => User }) 
  customer: any;

  @ApiProperty({ description: 'Parent order', type: () => Order, required: false })
  parent_order?: Order;

  @ApiProperty({ description: 'Parent order ID', required: false })
  @Column({ type: 'int', nullable: true })
  parent_id?: number;

  @ApiProperty({ description: 'Child orders', type: [Order], required: false })
  children?: Order[];

  @ApiProperty({ description: 'Order status', type: () => OrderStatus, required: false })
  status?: OrderStatus;

  @ApiProperty({ description: 'Order status type', enum: OrderStatusType, example: 'order-completed' })
  @Column({ type: 'varchar', nullable: true })
  order_status: OrderStatusType;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatusType, example: 'payment-success' })
  @Column({ type: 'varchar', nullable: true })
  payment_status: PaymentStatusType;

  @ApiProperty({ description: 'Amount', example: 14.5 })
  @Column({ type: 'float', nullable: true })
  amount: number;

  @ApiProperty({ description: 'Sales tax', example: 0.29 })
  @Column({ type: 'float', nullable: true })
  sales_tax: number;

  @ApiProperty({ description: 'Total', example: 64.79 })
  @Column({ type: 'float', nullable: true })
  total: number;

  @ApiProperty({ description: 'Paid total', example: 64.79 })
  @Column({ type: 'float', nullable: true })
  paid_total: number;

  @ApiProperty({ description: 'Payment ID', example: 'pi_123456789', required: false })
  @Column({ type: 'varchar', nullable: true })
  payment_id?: string;

  @ApiProperty({ description: 'Payment gateway', enum: PaymentGatewayType, example: 'CASH_ON_DELIVERY' })
  @Column({ type: 'varchar', nullable: true })
  payment_gateway: PaymentGatewayType;

  @ApiProperty({ description: 'Coupon', type: () => Coupon })
  coupon?: any;

  @ApiProperty({ description: 'Shop', type: () => Shop }) 
  shop?: any;

  @ApiProperty({ description: 'Discount', example: 0, required: false })
  @Column({ type: 'float', nullable: true })
  discount?: number;

  @ApiProperty({ description: 'Delivery fee', example: 50 })
  @Column({ type: 'float', nullable: true })
  delivery_fee: number;

  @ApiProperty({ description: 'Delivery time', example: 'Express Delivery' })
  @Column({ type: 'varchar', nullable: true })
  delivery_time: string;

  @ApiProperty({ description: 'Products', type: [Product] }) 
  products?: any[];

  @ApiProperty({ description: 'Billing address', type: () => UserAddress }) 

  @ApiProperty({ description: 'Shipping address', type: () => UserAddress }) 
  shipping_address?: any;

  @ApiProperty({ description: 'Language', example: 'en', required: false })
  @Column({ type: 'varchar', nullable: true })
  language?: string;

  @ApiProperty({ description: 'Translated languages', type: [String], example: ['en'], required: false })
  @Column({ type: 'simple-json', nullable: true })
  translated_languages?: string[];

  @ApiProperty({ description: 'Payment intent', type: () => PaymentIntent }) // Commented for future use
  payment_intent?: any;

  @ApiProperty({ description: 'Altered payment gateway', required: false })
  @Column({ type: 'varchar', nullable: true })
  altered_payment_gateway?: string;

  @OneToMany(() => Refund, (refund) => refund.order)
  refunds?: Refund[];

  @OneToMany(() => Review, (review) => review.order)
  reviews?: Review[];
}

@Entity('order_files')
export class OrderFiles extends CoreEntity {
  @ApiProperty({ description: 'Purchase key', example: 'fwNr6w0EriFVo3uW' })
  @Column({ type: 'varchar', nullable: true })
  purchase_key: string;

  @ApiProperty({ description: 'Digital file ID', example: 76 })
  @Column({ type: 'int', nullable: true })
  digital_file_id: number;

  @ApiProperty({ description: 'Order ID', required: false })
  @Column({ type: 'int', nullable: true })
  order_id?: number;

  @ApiProperty({ description: 'Customer ID', example: 2 })
  @Column({ type: 'int', nullable: true })
  customer_id: number;

  @ApiProperty({ description: 'File', type: () => File }) 
  file?: any;

  @ApiProperty({ description: 'Fileable product', type: () => Product }) 
  fileable?: any;
}