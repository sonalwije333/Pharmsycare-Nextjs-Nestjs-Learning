import { CoreEntity } from '../../common/entities/core.entity';

import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { Report } from './reports.entity'; // Make sure this import is correct
import { Column, Entity, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import {Shop} from "../../shops/entites/shop.entity";

@Entity()
export class Review extends CoreEntity {
    @Column('int')
    rating: number;

    @Column()
    name: string;

    @Column({ type: 'text' })
    comment: string;

    @ManyToOne(() => Shop, { eager: true })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;

    // Remove order relation since order module doesn't exist yet
    // @ManyToOne(() => Order, { eager: true })
    // @JoinColumn({ name: 'order_id' })
    // order: Order;

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'customer_id' })
    customer: User;

    @ManyToMany(() => Attachment)
    @JoinTable({
        name: 'review_photos',
        joinColumn: { name: 'review_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachment_id', referencedColumnName: 'id' }
    })
    photos: Attachment[];

    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @OneToMany(() => Report, report => report.modelId) // Use JavaScript property name
    abusive_reports: Report[];

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'product_id' })
    productId: number;

    @Column({ nullable: true, name: 'shop_id' })
    shopId: string;

    @Column({ nullable: true, name: 'variation_option_id' })
    variationOptionId: string;

    @Column({ default: 0, name: 'positive_feedbacks_count' })
    positiveFeedbacksCount: number;

    @Column({ default: 0, name: 'negative_feedbacks_count' })
    negativeFeedbacksCount: number;

    @Column({ default: 0, name: 'abusive_reports_count' })
    abusiveReportsCount: number;

    @Column({ default: 'en' })
    language: string;

    @Column('simple-array', { nullable: true, name: 'translated_languages' })
    translatedLanguages?: string[];

    @Column({ nullable: true, name: 'deleted_at' })
    deletedAt?: Date;
}