// refund-policies/entities/refund-policies.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Refund } from 'src/refunds/entities/refund.entity';
import { Shop } from 'src/shops/entities/shop.entity';
// import { Shop } from 'src/shops/entities/shop.entity';

@Entity('refund_policies')
export class RefundPolicy extends CoreEntity {
  @ApiProperty({ description: 'Refund policy ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Policy title', example: 'Vendor Return Policy' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Policy slug for URL', example: 'vendor-return-policy' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({
    description: 'Target audience',
    enum: ['vendor', 'customer'],
    example: 'vendor'
  })
  @Column()
  target: string;

  @ApiProperty({
    description: 'Policy status',
    enum: ['approved', 'pending', 'rejected'],
    example: 'approved'
  })
  @Column({ default: 'pending' })
  status: string;

  @ApiProperty({ description: 'Policy description', example: 'Our vendor return policy ensures...' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Language code', example: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Associated shop ID', required: false })
  @Column({ nullable: true })
  shop_id?: string;

  @ApiProperty({ type: () => Shop, description: 'Associated shop', required: false })
  @ManyToOne(() => Shop, shop => shop.refund_policies)
  shop?: Shop;

  @ApiProperty({ type: () => [Refund], description: 'Associated refunds', required: false })
  @OneToMany(() => Refund, refund => refund.refund_policy)
  refunds?: Refund[];

  @ApiProperty({
    description: 'Translated languages',
    type: [String],
    example: ['en', 'es', 'fr']
  })
  @Column('simple-array')
  translated_languages: Array<string>;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column({ nullable: true })
  deleted_at?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}