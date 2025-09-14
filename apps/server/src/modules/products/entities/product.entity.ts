import { BaseEntity } from 'src/modules/common/entities/base.entity';
import { Type } from 'src/modules/types/entities/type.entity';
import {Column, Entity, JoinColumn, ManyToMany, ManyToOne} from 'typeorm';
import {Tag} from "../../tags/entities/tag.entity";

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

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Type, { nullable: false, eager: true })
  @JoinColumn({ name: 'type_id' })
  type: Type;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  //     @ManyToOne(() => Shop, { nullable: false, eager: true })
  //   @JoinColumn({ name: 'shop_id' })
  //   shop: Shop;

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

  @Column()
  sku: string;

  @Column('int')
  quantity: number;

  @Column({ type: 'bool', default: true })
  in_stock: boolean;

  @Column({ type: 'bool', default: true })
  is_taxable: boolean;

  //     @ManyToOne(() => ShippingClass, { nullable: true, eager: true })
  //   @JoinColumn({ name: 'shipping_class_id' })
  //   shipping_class: ShippingClass;

  @Column()
  status: string;

  @Column({ default: 'simple' })
  product_type: 'simple' | 'variable';

  @Column({ nullable: true })
  unit: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  height: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  width: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  length: number;

    @ManyToMany(() => Tag, tag => tag.products)
    tags: Tag[];

}
