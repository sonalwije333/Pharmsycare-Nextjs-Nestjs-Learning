// order-tracking/entities/order-tracking.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

export enum TrackingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in-transit',
  OUT_FOR_DELIVERY = 'out-for-delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

@Entity('order_trackings')
export class OrderTracking extends CoreEntity {
  @ApiProperty({ description: 'Order ID', example: 1 })
  @Column({ type: 'int', nullable: false })
  order_id: number;

  @ApiProperty({ description: 'Current tracking status', enum: TrackingStatus, default: TrackingStatus.PENDING })
  @Column({ type: 'varchar', default: TrackingStatus.PENDING })
  status: TrackingStatus;

  @ApiProperty({ description: 'Tracking number', example: 'TRK123456789' })
  @Column({ type: 'varchar', nullable: true })
  tracking_number: string;

  @ApiProperty({ description: 'Carrier/Courier name', example: 'FedEx' })
  @Column({ type: 'varchar', nullable: true })
  carrier: string;

  @ApiProperty({ description: 'Current location', example: 'New York, NY' })
  @Column({ type: 'varchar', nullable: true })
  current_location: string;

  @ApiProperty({ description: 'Estimated delivery date', example: '2024-02-15' })
  @Column({ type: 'date', nullable: true })
  estimated_delivery_date: Date;

  @ApiProperty({ description: 'Actual delivery date', example: '2024-02-14' })
  @Column({ type: 'date', nullable: true })
  actual_delivery_date: Date;

  @ApiProperty({ description: 'Tracking details in JSON', example: { steps: ['Order Confirmed', 'Processing'] } })
  @Column({ type: 'simple-json', nullable: true })
  tracking_details: { steps?: string[]; updates?: any[] };

  @ApiProperty({ description: 'Notes from store owner/courier', example: 'Package left at door' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Last updated timestamp' })
  @Column({ type: 'datetime', nullable: true })
  last_updated: Date;

  @ApiProperty({ description: 'Updated by (staff ID)', example: 1 })
  @Column({ type: 'int', nullable: true })
  updated_by: number;

  @ApiProperty({ description: 'Order relation', type: () => Order })
  order?: Order;
}
