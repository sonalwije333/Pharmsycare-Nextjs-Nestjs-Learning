// src/modules/shops/entities/shop.entity.ts
import { CoreEntity } from 'src/modules/common/entities/core.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Shop extends CoreEntity {
    @ApiProperty({ type: () => User, description: 'Shop owner' })
    @ManyToOne(() => User, (user) => user.shops, { nullable: false })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @ApiProperty({ description: 'Shop name' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Shop slug (unique)' })
    @Column({ unique: true })
    slug: string;

    @ApiProperty({ description: 'Shop description', required: false })
    @Column({ nullable: true })
    description: string;

    @ApiProperty({ description: 'Shop address', required: false })
    @Column({ nullable: true })
    address?: string;

    @ApiProperty({ description: 'Cover image URL', required: false })
    @Column({ nullable: true, name: 'cover_image' })
    cover_image?: string;

    @ApiProperty({ description: 'Logo URL', required: false })
    @Column({ nullable: true })
    logo?: string;

    @ApiProperty({ description: 'Shop balance', default: 0 })
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    balance: number;

    @ApiProperty({ description: 'Is shop active', default: false })
    @Column({ type: 'boolean', default: false, name: 'is_active' })
    is_active: boolean;



}