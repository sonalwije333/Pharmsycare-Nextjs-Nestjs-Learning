import { BaseEntity } from 'src/modules/common/entities/base.entity';
import { Type } from 'src/modules/types/entities/type.entity';
import { Shop } from 'src/modules/shops/entites/shop.entity';
import { Tag } from 'src/modules/tags/entities/tag.entity';
import { ShippingClass } from 'src/modules/shippings/entities/shipping-class.entity';
import { Column, Entity, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { ProductStatus, ProductType } from 'src/common/enums/enums';

@Entity()
export class Product extends BaseEntity {
    @Column()
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: 'json', nullable: true })
    image: any;

    @Column({ type: 'json', nullable: true })
    gallery: any;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => Type, { eager: true })
    @JoinColumn({ name: 'type_id' })
    type: Type;

    @ManyToOne(() => Shop, { eager: true })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    sale_price: number;

    @Column({ default: 'en' })
    language: string;

    @Column('simple-array', { nullable: true })
    translated_languages: string[];

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    min_price: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    max_price: number;

    @Column({ nullable: true })
    sku: string;

    @Column('int', { default: 0 })
    quantity: number;

    @Column({ type: 'boolean', default: true })
    in_stock: boolean;

    @Column({ type: 'boolean', default: true })
    is_taxable: boolean;

    @ManyToOne(() => ShippingClass, { eager: true, nullable: true })
    @JoinColumn({ name: 'shipping_class_id' })
    shipping_class: ShippingClass;

    @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
    status: ProductStatus;

    @Column({ type: 'enum', enum: ProductType, default: ProductType.SIMPLE })
    product_type: ProductType;

    @Column({ nullable: true })
    unit: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    height: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    width: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    length: number;

    @ManyToMany(() => Tag, tag => tag.products, { eager: true })
    @JoinTable({
        name: 'product_tags',
        joinColumn: { name: 'product_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
    })
    tags: Tag[];
}