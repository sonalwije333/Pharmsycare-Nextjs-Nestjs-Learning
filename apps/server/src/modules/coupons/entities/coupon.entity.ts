// src/modules/coupons/entities/coupon.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import {Shop} from "../../shops/entites/shop.entity";
import {CouponType} from "../../../common/enums/enums";


@Entity()
export class Coupon extends CoreEntity {
    @Column({ unique: true })
    code: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    minimum_cart_amount: number;

    // @ManyToMany(() => Order, order => order.coupons)
    // @JoinTable()
    // orders?: Order[];

    @Column({ type: 'enum', enum: CouponType, default: CouponType.DEFAULT_COUPON })
    type: CouponType;

    @OneToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
    @JoinColumn()
    image: Attachment;

    @Column({ default: true })
    is_valid: boolean;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    amount: number;

    @Column({ type: 'timestamp' })
    active_from: Date;

    @Column({ type: 'timestamp' })
    expire_at: Date;

    @Column({ default: 'en' })
    language: string;

    @Column({ type: 'json', nullable: true })
    translated_languages: string[];

    @Column({ default: false })
    target?: boolean;

    @Column({ nullable: true })
    shop_id?: number;

    @ManyToOne(() => Shop, { eager: true, nullable: true })
    @JoinColumn({ name: 'shop_id' })
    shop?: Shop;

    @Column({ default: false })
    is_approve?: boolean;
}