import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { OrderStatusType, PaymentGatewayType, PaymentStatusType } from 'src/common/enums/order-payment.enum';
import { Refund } from 'src/refunds/entities/refund.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Column, Entity, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';


@Entity('orders')
export class Order extends CoreEntity {
  @ApiProperty({ description: 'Tracking number', example: '20240207303639', type: String })
  @Column({ type: 'varchar', nullable: true })
  tracking_number: string;

  @ApiProperty({ description: 'Customer ID', example: 2, type: Number })
  @Column({ type: 'int', nullable: true })
  customer_id: number;

  @ApiProperty({ description: 'Customer contact', example: '19365141641631', type: String })
  @Column({ type: 'varchar', nullable: true })
  customer_contact: string;

  @ApiHideProperty()
  @Column({ type: 'int', nullable: true })
  parent_id?: number;

  @ApiHideProperty()
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent_order?: Order;

  @ApiHideProperty()
  @OneToMany(() => Order, (order) => order.parent_order)
  child_orders?: Order[];

  @ApiProperty({ description: 'Order status type', enum: OrderStatusType, example: 'order-completed', type: String })
  @Column({ type: 'varchar', nullable: true })
  order_status: OrderStatusType;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatusType, example: 'payment-success', type: String })
  @Column({ type: 'varchar', nullable: true })
  payment_status: PaymentStatusType;

  @ApiProperty({ description: 'Amount', example: 14.5, type: Number })
  @Column({ type: 'float', nullable: true })
  amount: number;

  @ApiProperty({ description: 'Sales tax', example: 0.29, type: Number })
  @Column({ type: 'float', nullable: true })
  sales_tax: number;

  @ApiProperty({ description: 'Total', example: 64.79, type: Number })
  @Column({ type: 'float', nullable: true })
  total: number;

  @ApiProperty({ description: 'Paid total', example: 64.79, type: Number })
  @Column({ type: 'float', nullable: true })
  paid_total: number;

  @ApiProperty({ description: 'Payment ID', example: 'pi_123456789', required: false, type: String })
  @Column({ type: 'varchar', nullable: true })
  payment_id?: string;

  @ApiProperty({ description: 'Payment gateway', enum: PaymentGatewayType, example: 'CASH_ON_DELIVERY', type: String })
  @Column({ type: 'varchar', nullable: true })
  payment_gateway: PaymentGatewayType;

  @ApiProperty({ description: 'Discount', example: 0, required: false, type: Number })
  @Column({ type: 'float', nullable: true })
  discount?: number;

  @ApiProperty({ description: 'Delivery fee', example: 50, type: Number })
  @Column({ type: 'float', nullable: true })
  delivery_fee: number;

  @ApiProperty({ description: 'Delivery time', example: 'Express Delivery', type: String })
  @Column({ type: 'varchar', nullable: true })
  delivery_time: string;

  @ApiHideProperty()
  @OneToMany(() => Refund, (refund) => refund.order)
  refunds?: Refund[];

  @ApiHideProperty()
  @OneToMany(() => Review, (review) => review.order)
  reviews?: Review[];

  @ApiProperty({ description: 'Language', example: 'en', required: false, type: String })
  @Column({ type: 'varchar', nullable: true })
  language?: string;

  @ApiProperty({ description: 'Translated languages', type: [String], example: ['en'], required: false })
  @Column({ type: 'simple-json', nullable: true })
  translated_languages?: string[];

  @ApiProperty({ description: 'Altered payment gateway', required: false, type: String })
  @Column({ type: 'varchar', nullable: true })
  altered_payment_gateway?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp', type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp', type: Date })
  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('order_files')
export class OrderFiles extends CoreEntity {
  @ApiProperty({ description: 'Purchase key', example: 'fwNr6w0EriFVo3uW', type: String })
  @Column({ type: 'varchar', nullable: true })
  purchase_key: string;

  @ApiProperty({ description: 'Digital file ID', example: 76, type: Number })
  @Column({ type: 'int', nullable: true })
  digital_file_id: number;

  @ApiProperty({ description: 'Order ID', required: false, type: Number })
  @Column({ type: 'int', nullable: true })
  order_id?: number;

  @ApiProperty({ description: 'Customer ID', example: 2, type: Number })
  @Column({ type: 'int', nullable: true })
  customer_id: number;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp', type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp', type: Date })
  @UpdateDateColumn()
  updated_at: Date;
}