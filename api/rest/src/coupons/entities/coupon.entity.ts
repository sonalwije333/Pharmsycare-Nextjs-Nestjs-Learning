import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { CouponType } from 'src/common/enums/coupon-type.enum';


@Entity('coupons')
export class Coupon extends CoreEntity {
  @ApiProperty({ description: 'Coupon ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ 
    description: 'Coupon code', 
    example: '5OFF',
    type: String,
  })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ 
    description: 'Coupon description', 
    required: false,
    type: String,
  })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ 
    description: 'Minimum cart amount', 
    example: 0,
    type: Number,
  })
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
  type: string;

  @ApiProperty({
    type: Attachment,
    description: 'Coupon image',
    required: false,
  })
  @Column('json', { nullable: true })
  image?: Attachment;

  @ApiProperty({ 
    description: 'Is valid', 
    example: true,
    type: Boolean,
  })
  @Column({ default: true })
  is_valid: boolean;

  @ApiProperty({ 
    description: 'Discount amount', 
    example: 5,
    type: Number,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({
    description: 'Active from date',
    example: '2021-03-28T05:46:42.000Z',
    type: String,
  })
  @Column()
  active_from: string;

  @ApiProperty({
    description: 'Expire at date',
    example: '2024-06-23T05:46:42.000Z',
    type: String,
  })
  @Column()
  expire_at: string;

  @ApiProperty({ 
    description: 'Language code', 
    default: 'en',
    type: String,
  })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ 
    description: 'Translated languages', 
    type: [String],
    example: ['en', 'es', 'fr'],
  })
  @Column('simple-array', { nullable: true })
  translated_languages: string[];

  @ApiProperty({ 
    description: 'Target', 
    required: false, 
    default: 0,
    type: Number,
  })
  @Column({ type: 'int', nullable: true, default: 0 })
  target?: number;

  @ApiProperty({ 
    description: 'Shop ID', 
    required: false,
    type: Number,
  })
  @Column({ nullable: true })
  shop_id?: number;

  @ApiProperty({ 
    description: 'Is approved', 
    required: false, 
    default: true,
    type: Boolean,
  })
  @Column({ type: 'boolean', nullable: true, default: true })
  is_approve?: boolean;

  @ApiProperty({ 
    description: 'User ID', 
    required: false,
    type: Number,
  })
  @Column({ nullable: true })
  user_id?: number;

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