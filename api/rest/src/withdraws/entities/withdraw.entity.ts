// src/withdraws/entities/withdraw.entity.ts
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum WithdrawStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  ON_HOLD = 'On hold',
  REJECTED = 'Rejected',
  PROCESSING = 'Processing',
}

@Entity('withdraws')
export class Withdraw extends CoreEntity {
  @ApiProperty({ description: 'Withdrawal amount', example: 300 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ 
    description: 'Withdrawal status', 
    enum: WithdrawStatus, 
    example: WithdrawStatus.PENDING 
  })
  @Column({
    type: 'enum',
    enum: WithdrawStatus,
    default: WithdrawStatus.PENDING,
  })
  status: WithdrawStatus;

  @ApiProperty({ description: 'Shop ID', example: 3 })
  @Column({ type: 'int', name: 'shop_id' })
  shop_id: number;

  @ApiProperty({ type: () => Shop, description: 'Associated shop' })
  @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @ApiProperty({ description: 'Payment method', example: 'Bkash' })
  @Column({ type: 'varchar', length: 255, name: 'payment_method' })
  payment_method: string;

  @ApiProperty({ 
    description: 'Payment details', 
    example: '01679373064\nBkash Personal',
    required: false 
  })
  @Column({ type: 'text', nullable: true })
  details: string;

  @ApiProperty({ 
    description: 'Additional note', 
    example: 'Kindly Send My Balance before next week.',
    required: false 
  })
  @Column({ type: 'text', nullable: true })
  note: string;
}