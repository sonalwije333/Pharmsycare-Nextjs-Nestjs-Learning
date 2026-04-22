// shipping/entities/shipping.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';

export enum ShippingType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE = 'free',
}

@Entity('shippings')
export class Shipping extends CoreEntity {
  @ApiProperty({ description: 'Shipping ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Shipping method name', example: 'Express Shipping' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Shipping amount', example: 25 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Is this a global shipping method', example: true })
  @Column({ default: false })
  is_global: boolean;

  @ApiProperty({
    description: 'Shipping type',
    enum: ShippingType,
    example: ShippingType.FIXED
  })
  @Column({ type: 'enum', enum: ShippingType, default: ShippingType.FIXED })
  type: ShippingType;

  @ApiProperty({ description: 'Associated shop ID', required: false })
  @Column({ nullable: true })
  shop_id?: number;

  @ApiProperty({ type: () => Shop, description: 'Associated shop', required: false })
  @ManyToOne(() => Shop, shop => shop.shippings)
  shop?: Shop;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}