// shops/entities/shop.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  BeforeInsert,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';
import { User } from 'src/users/entities/user.entity';
import { Shipping } from 'src/shippings/entities/shipping.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { StoreNotice } from 'src/store-notices/entities/store-notices.entity';
import { Refund } from 'src/refunds/entities/refund.entity';
import { RefundPolicy } from 'src/refund-policies/entities/refund-policies.entity';

export class PaymentInfo {
  @ApiProperty({ example: '1234567890' })
  account: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'Bank of America' })
  bank: string;
}

export class Balance {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  admin_commission_rate: number;

  @ApiProperty({ type: () => Shop })
  shop: unknown;

  @ApiProperty({ example: 5000 })
  total_earnings: number;

  @ApiProperty({ example: 2000 })
  withdrawn_amount: number;

  @ApiProperty({ example: 3000 })
  current_balance: number;

  @ApiProperty({ type: () => PaymentInfo })
  payment_info: PaymentInfo;
}

export class ShopSettings {
  @ApiProperty({ type: [ShopSocials], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShopSocials)
  socials?: ShopSocials[];

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ type: () => Location, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => Location)
  location?: Location;

  @ApiProperty({ example: 'https://example.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  notifications?: any;
}

@Entity('shops')
export class Shop extends CoreEntity {
  @ApiProperty({ description: 'Shop ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Owner ID', example: 1 })
  @Column({ nullable: true })
  owner_id: number;

  @ApiProperty({ type: () => User, description: 'Shop owner' })
  @ManyToOne(() => User, (user) => user.shops)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ApiProperty({ type: () => [User], description: 'Shop staff' })
  @OneToMany(() => User, (user) => user.shop)
  staffs?: User[];

  @ApiProperty({
    type: () => [RefundPolicy],
    description: 'Shop refund policies',
    required: false,
  })
  @OneToMany(() => RefundPolicy, (policy) => policy.shop)
  refund_policies?: RefundPolicy[];

  @ApiProperty({
    type: () => [Refund],
    description: 'Shop refunds',
    required: false,
  })
  @OneToMany(() => Refund, (refund) => refund.shop)
  refunds?: Refund[];

  @ApiProperty({
    type: () => [Shipping],
    description: 'Shop shippings',
    required: false,
  })
  @OneToMany(() => Shipping, (shipping) => shipping.shop)
  shippings?: Shipping[];

  @ApiProperty({
    type: () => [Review],
    description: 'Shop reviews',
    required: false,
  })
  @OneToMany(() => Review, (review) => review.shop)
  reviews?: Review[];

  @ApiProperty({
    type: () => [StoreNotice],
    description: 'Store notices',
    required: false,
  })
  @ManyToMany(() => StoreNotice, (storeNotice) => storeNotice.shops)
  notices?: StoreNotice[];

  @ApiProperty({ description: 'Is shop active', example: true })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Orders count', example: 10 })
  @Column({ default: 0 })
  orders_count: number;

  @ApiProperty({ description: 'Products count', example: 50 })
  @Column({ default: 0 })
  products_count: number;

  @ApiProperty({
    type: () => Balance,
    description: 'Shop balance',
    required: false,
  })
  @Column('json', { nullable: true })
  balance?: Balance;

  @ApiProperty({ description: 'Shop name', example: 'Furniture Shop' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Shop slug', example: 'furniture-shop' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: 'Shop description', required: false })
  @Column('text', { nullable: true })
  description?: string;

  @ApiProperty({ type: () => Attachment, description: 'Shop cover image' })
  @Column('json', { nullable: true })
  cover_image: Attachment;

  @ApiProperty({
    type: () => Attachment,
    description: 'Shop logo',
    required: false,
  })
  @Column('json', { nullable: true })
  logo?: Attachment;

  @ApiProperty({ type: () => UserAddress, description: 'Shop address' })
  @Column('json', { nullable: true })
  address: UserAddress;

  @ApiProperty({
    type: () => ShopSettings,
    description: 'Shop settings',
    required: false,
  })
  @Column('json', { nullable: true })
  settings?: ShopSettings;

  @ApiProperty({ description: 'Shop distance', required: false })
  @Column({ nullable: true })
  distance?: string;

  @ApiProperty({ description: 'Latitude', required: false })
  @Column({ nullable: true })
  lat?: string;

  @ApiProperty({ description: 'Longitude', required: false })
  @Column({ nullable: true })
  lng?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;

  // Auto-generate slug from name if not provided
  @BeforeInsert()
  generateSlug() {
    if (!this.slug && this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }
}
