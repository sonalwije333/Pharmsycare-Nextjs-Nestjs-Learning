// store-notices/entities/store-notices.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';

export enum StoreNoticePriorityType {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('store_notices')
export class StoreNotice extends CoreEntity {
  @ApiProperty({ description: 'Store notice ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Notice priority',
    enum: StoreNoticePriorityType,
    example: StoreNoticePriorityType.HIGH
  })
  @Column({ type: 'enum', enum: StoreNoticePriorityType, default: StoreNoticePriorityType.MEDIUM })
  priority: StoreNoticePriorityType;

  @ApiProperty({ description: 'Notice title', example: 'Big Sale !!!' })
  @Column()
  notice: string;

  @ApiProperty({ description: 'Notice description', required: false })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Effective from date', required: false })
  @Column({ nullable: true })
  effective_from?: string;

  @ApiProperty({ description: 'Expiration date', example: '2023-04-29 18:00:00' })
  @Column()
  expired_at: string;

  @ApiProperty({ description: 'Notice type', example: 'all_vendor', required: false })
  @Column({ nullable: true })
  type?: string;

  @ApiProperty({ description: 'Is notice read by current user', default: false })
  @Column({ default: false })
  is_read?: boolean;

  @ApiProperty({ type: () => [Shop], description: 'Associated shops', required: false })
  @ManyToMany(() => Shop, shop => shop.notices)
  shops?: Shop[];

  @ApiProperty({ type: () => [User], description: 'Users who received this notice', required: false })
  @ManyToMany(() => User, user => user.notices)
  users?: User[];

  @ApiProperty({ description: 'Received by (comma-separated user IDs)', required: false })
  @Column({ nullable: true })
  received_by?: string;

  @ApiProperty({ description: 'Created by user ID', example: 6 })
  @Column()
  created_by: string;

  @ApiProperty({ description: 'Updated by user ID', required: false })
  @Column({ nullable: true })
  updated_by?: string;

  @ApiProperty({ description: 'Expiration date (alias)', required: false })
  @Column({ nullable: true })
  expire_at?: string;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  @Column({ nullable: true })
  deleted_at?: string;

  @ApiProperty({ description: 'Creator user name/role for display', required: false })
  creator_role?: string;

  // @ApiProperty({ description: 'Creator details', required: false })
  // creator?: any;

  @ApiProperty({ description: 'Translated languages', type: [String], required: false })
  @Column('simple-array', { nullable: true })
  translated_languages?: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}