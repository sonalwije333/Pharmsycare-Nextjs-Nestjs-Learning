// ownership-transfer/entities/ownership-transfer.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';
// import { Refund } from 'src/refunds/entities/refund.entity'; // Commented for future use
// import { Shop } from 'src/shops/entities/shop.entity'; // Commented for future use
// import { Withdraw } from 'src/withdraws/entities/withdraw.entity'; // Commented for future use
import { User } from 'src/users/entities/user.entity';

export class TodayTotalOrderByStatus {
  @ApiProperty({ description: 'Pending orders count', example: 5 })
  pending: number;

  @ApiProperty({ description: 'Processing orders count', example: 3 })
  processing: number;

  @ApiProperty({ description: 'Complete orders count', example: 10 })
  complete: number;

  @ApiProperty({ description: 'Cancelled orders count', example: 2 })
  cancelled: number;

  @ApiProperty({ description: 'Refunded orders count', example: 1 })
  refunded: number;

  @ApiProperty({ description: 'Failed orders count', example: 0 })
  failed: number;

  @ApiProperty({ description: 'Local facility orders count', example: 0 })
  localFacility: number;

  @ApiProperty({ description: 'Out for delivery orders count', example: 0 })
  outForDelivery: number;
}

@Entity('ownership_transfer')
export class OwnershipTransfer extends CoreEntity {
  @ApiProperty({ description: 'Created by user ID', example: 6 })
  @Column()
  created_by: string;

  @ApiProperty({ description: 'Deleted at timestamp', required: false })
  @Column({ nullable: true })
  deleted_at?: string;

  @ApiProperty({ description: 'Transaction identifier', example: '2024-08-03-0001' })
  @Column()
  transaction_identifier: string;

  @ApiProperty({ description: 'Previous owner', type: () => User })
  @Column('json', { nullable: true })
  previous_owner?: User;

  @ApiProperty({ description: 'Current owner', type: () => User })
  @Column('json', { nullable: true })
  current_owner?: User;

  @ApiProperty({ description: 'Transfer message', required: false })
  @Column({ type: 'text', nullable: true })
  message?: string;

  @ApiProperty({ description: 'Transfer status', enum: ['pending', 'approved', 'rejected', 'completed'], example: 'pending' })
  @Column({ default: 'pending' })
  status: string;

  // @ApiProperty({ description: 'Shop', type: () => Shop }) // Commented for future use
  // shop: Shop;

  // @ApiProperty({ description: 'Refund information', type: [Refund], required: false }) // Commented for future use
  // refund_info?: Refund[];

  // @ApiProperty({ description: 'Withdrawal information', type: [Withdraw], required: false }) // Commented for future use
  // withdrawal_info?: Withdraw[];

  @ApiProperty({ description: 'Order information', type: () => TodayTotalOrderByStatus, required: false })
  @Column('json', { nullable: true })
  order_info?: TodayTotalOrderByStatus;

  // @ApiProperty({ description: 'Balance information', type: () => Balance }) // Commented for future use
  // balance_info: Balance;

  @ApiProperty({ description: 'Name', example: 'Transfer Name', required: false })
  @Column({ nullable: true })
  name?: string;
}