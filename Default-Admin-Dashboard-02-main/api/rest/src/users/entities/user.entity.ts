// users/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Address } from 'src/addresses/entities/address.entity';
import { Profile } from './profile.entity';
import { Permission } from '../../common/enums/enums';
import { Question } from 'src/questions/entities/question.entity';
import { Refund } from 'src/refunds/entities/refund.entity';
import { Report } from 'src/reports/entities/report.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { StoreNotice } from 'src/store-notices/entities/store-notices.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @Column()
  name: string;

  @Exclude()
  @Column({ nullable: true })
  password?: string;

  @ApiProperty({ description: 'Account status', example: true })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({ type: () => Profile, description: 'User profile' })
  @OneToOne(() => Profile, (profile) => profile.customer, {
    cascade: true,
    eager: false,
  })
  @JoinColumn()
  profile?: Profile;

  @ApiProperty({ type: () => [Shop], description: 'User shops' })
  @OneToMany(() => Shop, (shop) => shop.owner)
  shops?: Shop[];

  @ApiProperty({ type: () => Shop, description: 'Managed shop' })
  @ManyToOne(() => Shop, (shop: Shop) => shop.staffs, { nullable: true })
  shop?: Shop;

  @ApiProperty({ type: () => [Address], description: 'User addresses' })
  @OneToMany(() => Address, (address) => address.customer)
  address?: Address[];

  @OneToMany(() => Question, (question) => question.user)
  questions?: Question[];

  @OneToMany(() => Refund, (refund) => refund.customer)
  refunds?: Refund[];

  @OneToMany(() => Report, (report) => report.user)
  reports?: Report[];

  @OneToMany(() => Review, (review) => review.user)
  reviews?: Review[];

  @ApiProperty({ type: () => [StoreNotice], description: 'User notices', required: false })
  @ManyToMany(() => StoreNotice, (storeNotice) => storeNotice.users)
  notices?: StoreNotice[];

  @ApiProperty({ type: () => [Wishlist], description: 'User wishlists', required: false })
  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlists?: Wishlist[];

  @ApiProperty({
    enum: Permission,
    isArray: true,
    description: 'User permissions',
    example: [Permission.CUSTOMER],
  })
  @Column('simple-array')
  permissions?: Permission[];

  @ApiProperty({
    type: 'object',
    description: 'Wallet information',
    example: { total_points: 100, points_used: 20, available_points: 80 },
  })
  @Column('json', { nullable: true })
  wallet?: {
    total_points?: number;
    points_used?: number;
    available_points?: number;
  };

  @Exclude()
  @Column({ nullable: true })
  refreshToken?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
