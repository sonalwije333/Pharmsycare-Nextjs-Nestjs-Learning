import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { AddressType } from 'src/common/enums/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UserAddress {
  @ApiProperty()
  street_address: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  zip: string;
}

@Entity()
export class Address extends CoreEntity {
  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  default: boolean;

  @ApiProperty({ type: UserAddress })
  @Column('json')
  address: UserAddress;

  @ApiProperty({ enum: AddressType })
  @Column({ type: 'enum', enum: AddressType })
  type: AddressType;

  @ManyToOne(() => User, (user) => user.address)
  customer: User;
}