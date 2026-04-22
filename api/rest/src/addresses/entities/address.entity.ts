// addresses/entities/address.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { AddressType } from '../../common/enums/enums';

export class UserAddress {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  street_address: string;

  @ApiProperty({ description: 'Country', example: 'United States' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State', example: 'NY' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'ZIP/Postal code', example: '10001' })
  @IsString()
  @IsNotEmpty()
  zip: string;
}

@Entity('addresses')
export class Address extends CoreEntity {
  @ApiProperty({ description: 'Address ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Address title', example: 'Home' })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Whether this is default address',
    example: false,
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
  @Column({ type: 'enum', enum: AddressType })
  type: AddressType;

  @ApiProperty({ type: () => User, description: 'Associated customer' })
  @ManyToOne(() => User, (user) => user.address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ApiProperty({ description: 'Customer ID', example: 1 })
  @Column()
  customer_id: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
