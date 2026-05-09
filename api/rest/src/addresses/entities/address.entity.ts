import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { AddressType } from 'src/common/enums/address-type.enum';

export class UserAddress {
  @ApiProperty({ description: 'Street address', example: '123 Main St', type: String })
  street_address: string;

  @ApiProperty({ description: 'Country', example: 'United States', type: String })
  country: string;

  @ApiProperty({ description: 'City', example: 'New York', type: String })
  city: string;

  @ApiProperty({ description: 'State', example: 'NY', type: String })
  state: string;

  @ApiProperty({ description: 'ZIP/Postal code', example: '10001', type: String })
  zip: string;
}

@Entity('addresses')
export class Address extends CoreEntity {
  @ApiProperty({ description: 'Address ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Address title', example: 'Home', type: String })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Whether this is default address',
    example: false,
    type: Boolean,
    default: false,
  })
  @Column({ default: false })
  default: boolean;

  @ApiProperty({
    description: 'Address details',
    type: UserAddress,
    example: {
      street_address: '123 Main St',
      country: 'United States',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    },
  })
  @Column('json')
  address: UserAddress;

  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
    example: AddressType.SHIPPING,
  })
  @Column({ type: 'varchar', length: 50 })
  type: AddressType;

  @ApiHideProperty()
  @ManyToOne(() => User, (user) => user.address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ApiProperty({ description: 'Customer ID', example: 1, type: Number })
  @Column()
  customer_id: number;

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