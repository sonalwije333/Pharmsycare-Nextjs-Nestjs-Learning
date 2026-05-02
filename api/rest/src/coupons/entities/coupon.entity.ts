// coupons/entities/coupon.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { CouponType } from '../../common/enums/enums';

@Entity('coupons')
export class Coupon extends CoreEntity {
  @ApiProperty({ description: 'Coupon ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Coupon code', example: '5OFF' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ description: 'Coupon description', required: false })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ description: 'Minimum cart amount', example: 0 })
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minimum_cart_amount: number;

  @ApiProperty({
    enum: CouponType,
    description: 'Coupon type',
    example: CouponType.FIXED,
  })
  @Column({
    type: 'varchar',
    length: 20,
    default: CouponType.FIXED,
  })
  type: string; // Use string type instead of enum

  @ApiProperty({
    type: Attachment,
    description: 'Coupon image',
    required: false,
  })
  @Column('json', { nullable: true })
  image: Attachment;

  @ApiProperty({ description: 'Is valid', example: true })
  @Column({ default: true })
  is_valid: boolean;

  @ApiProperty({ description: 'Discount amount', example: 5 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Active from date',
    example: '2021-03-28T05:46:42.000Z',
  })
  @Column()
  active_from: string;

  @ApiProperty({
    description: 'Expire at date',
    example: '2024-06-23T05:46:42.000Z',
  })
  @Column()
  expire_at: string;

  @ApiProperty({ description: 'Language code', default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Translated languages', type: [String] })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ApiProperty({ description: 'Target', required: false, default: 0 })
  @Column({ type: 'int', nullable: true, default: 0 })
  target?: number;

  @ApiProperty({ description: 'Shop ID', required: false })
  @Column({ nullable: true })
  shop_id?: number;

  @ApiProperty({ description: 'Is approved', required: false, default: true })
  @Column({ type: 'boolean', nullable: true, default: true })
  is_approve?: boolean;

  @ApiProperty({ description: 'User ID', required: false })
  @Column({ nullable: true })
  user_id?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
