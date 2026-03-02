import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ShippingType } from '../../../common/enums/enums';

@Entity('shippings')
export class Shipping extends CoreEntity {
  @ApiProperty({ description: 'Shipping name', example: 'Standard Shipping' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Shipping amount', example: 10.99 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Is global shipping', example: false })
  @Column({ name: 'is_global', default: false })
  is_global: boolean;

  @ApiProperty({
    description: 'Shipping type',
    enum: ShippingType,
    example: ShippingType.FIXED,
  })
  @Column({ type: 'enum', enum: ShippingType, default: ShippingType.FIXED })
  type: ShippingType;

  @ApiProperty({
    description: 'Shipping description',
    example: 'Standard delivery within 3-5 business days',
    required: false,
  })
  @Column({ nullable: true, type: 'text' })
  description?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;
}
