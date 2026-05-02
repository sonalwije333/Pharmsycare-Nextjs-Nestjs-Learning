import { UserAddress } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity } from 'typeorm';

export class PaymentInfo {
  account: string;
  name: string;
  email: string;
  bank: string;
}

export class Balance {
  id: number;
  admin_commission_rate: number;
  shop: Shop;
  total_earnings: number;
  withdrawn_amount: number;
  current_balance: number;
  payment_info: PaymentInfo;
}

export class ShopSettings {
  socials: ShopSocials[];
  contact: string;
  location: Location;
  website: string;
}

@Entity('shops')
export class Shop extends CoreEntity {
  @Column({ nullable: true })
  owner_id: number;

  owner: User;
  staffs?: User[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  orders_count: number;

  @Column({ default: 0 })
  products_count: number;

  @Column('json', { nullable: true })
  balance?: Balance;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('json', { nullable: true })
  cover_image: Attachment;

  @Column('json', { nullable: true })
  logo?: Attachment;

  @Column('json', { nullable: true })
  address: UserAddress;

  @Column('json', { nullable: true })
  settings?: ShopSettings;

  @Column({ nullable: true })
  distance?: string;

  @Column({ nullable: true })
  lat?: string;

  @Column({ nullable: true })
  lng?: string;
}
