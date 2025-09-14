import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import { Entity, Column, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Shop } from "../../shops/entites/shop.entity";
import {StoreNoticePriorityType, StoreNoticeType} from "../../../common/enums/enums";



@Entity('store_notices')
export class StoreNotice extends CoreEntity {
    @ApiProperty({ enum: StoreNoticePriorityType, example: StoreNoticePriorityType.High })
    @Column({ type: 'enum', enum: StoreNoticePriorityType })
    priority: StoreNoticePriorityType;

    @ApiProperty({ example: 'Important Notice' })
    @Column()
    notice: string;

    @ApiProperty({ example: 'This is a detailed description', required: false })
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
    @Column({ name: 'effective_from', type: 'timestamp', nullable: true })
    effective_from?: Date;

    @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
    @Column({ name: 'expired_at', type: 'timestamp' })
    expired_at: Date;

    @ApiProperty({ enum: StoreNoticeType, example: StoreNoticeType.ALL_SHOP })
    @Column({ type: 'enum', enum: StoreNoticeType })
    type: StoreNoticeType;

    @ApiProperty({ example: false, default: false })
    @Column({ name: 'is_read', type: 'boolean', default: false })
    is_read?: boolean;

    @ApiProperty({ type: () => [Shop], required: false })
    @ManyToMany(() => Shop, shop => shop.storeNotices)
    @JoinTable({
        name: 'store_notice_shops',
        joinColumn: { name: 'store_notice_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'shop_id', referencedColumnName: 'id' }
    })
    shops?: Shop[];

    @ApiProperty({ type: () => [User], required: false })
    @ManyToMany(() => User, user => user.storeNotices)
    @JoinTable({
        name: 'store_notice_users',
        joinColumn: { name: 'store_notice_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
    })
    users?: User[];

    @ApiProperty({ example: 'all_vendors', description: 'Target audience' })
    @Column({ name: 'received_by' })
    received_by: string;

    @ApiProperty({ type: () => User, description: 'User who created the notice' })
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'created_by' })
    created_by: User;

    @ApiProperty({ example: ['en', 'fr'], description: 'Supported languages' })
    @Column({
        name: 'translated_languages',
        type: 'varchar',
        length: 255,
        nullable: true
    })
    translated_languages?: string;
}