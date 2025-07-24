import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

export class UserAddress {
  street_address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
}

@Entity()
export class Address extends CoreEntity {
  @Column()
  title: string;

  @Column()
  default: boolean;

  @Column('json')
  address: UserAddress;

  @Column({ type: 'enum', enum: AddressType })
  type: AddressType;

  @ManyToOne(() => User, (user) => user.address)
  customer: User;
}
