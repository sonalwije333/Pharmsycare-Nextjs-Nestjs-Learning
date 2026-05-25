// entities/product.entity.ts
import { Category } from 'src/categories/entities/category.entity';
import { CoreEntity } from '../../common/entities/core.entity';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Question } from 'src/questions/entities/question.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';
import { Column, Entity, OneToMany } from 'typeorm';


export enum ProductStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
}

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
}

export class ImageAttachment {
  id: string | number;
  original: string;
  thumbnail: string;
  file_name?: string;
}

export class RatingCount {
  rating: number;
  total: number;
  positive_feedbacks_count: number;
  negative_feedbacks_count: number;
  my_feedback: any;
  abusive_reports_count: number;
}

export class Type {
  id: number;
  name: string;
  slug: string;
  language?: string;
  icon?: string;
  settings?: any;
  promotional_sliders?: any[];
  created_at?: string;
  updated_at?: string;
  translated_languages?: string[];
}

export class Address {
  country: string;
  city: string;
  state: string;
  zip: string;
  street_address: string;
}

export class ShopSocial {
  icon: string;
  url: string;
}

export class ShopSettings {
  notifications?: { email: any };
  contact?: string;
  website?: string;
  socials?: ShopSocial[];
  location?: any;
}

export class Shop {
  id: number;
  owner_id: number;
  name: string;
  slug: string;
  description?: string;
  cover_image?: ImageAttachment;
  logo?: ImageAttachment;
  is_active: number;
  address?: Address;
  settings?: ShopSettings;
  notifications?: any;
  created_at?: string;
  updated_at?: string;
}

@Entity('products')
export class Product extends CoreEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  type_id: number;

  @Column('json', { nullable: true })
  type: Type;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price?: number;
  shop_id: number;
  shop: Shop;
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sale_price?: number;

  @Column({ default: 'en', nullable: true })
  language?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  min_price?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  max_price?: number;

  @Column({ nullable: true })
  sku?: string;

  @Column({ default: 0 })
  quantity: number;

  @Column({ default: 0, nullable: true })
  sold_quantity?: number;

  @Column({ default: 1 })
  in_stock: number;

  @Column({ default: 0 })
  is_taxable: number;

  @Column({ default: 0 })
  in_flash_sale: number;

  @Column({ nullable: true })
  shipping_class_id?: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.PUBLISH })
  status: ProductStatus;

  @Column({ type: 'enum', enum: ProductType, default: ProductType.SIMPLE })
  product_type: ProductType;

  @Column({ nullable: true })
  unit?: string;

  @Column({ nullable: true })
  height?: string;

  @Column({ nullable: true })
  width?: string;

  @Column({ nullable: true })
  length?: string;

  @Column('json', { nullable: true })
  image?: ImageAttachment;

  @Column('json', { nullable: true })
  video?: any;

  @Column('json', { nullable: true })
  gallery?: ImageAttachment[];

  @Column({ nullable: true })
  deleted_at?: string;

  @Column({ nullable: true })
  author_id?: number;

  @Column({ nullable: true })
  manufacturer_id?: number;

  @Column({ default: 0 })
  is_digital: number;

  @Column({ default: 0 })
  is_external: number;

  @Column({ nullable: true })
  external_product_url?: string;

  @Column({ nullable: true })
  external_product_button_text?: string;

  @Column('json', { nullable: true })
  blocked_dates?: any[];

  @Column({ nullable: true })
  orders_count?: number;

  @Column('float', { nullable: true })
  ratings?: number;

  @Column({ nullable: true })
  total_reviews?: number;

  @Column('json', { nullable: true })
  rating_count?: RatingCount[];

  @Column('json', { nullable: true })
  my_review?: any;

  @Column({ nullable: true })
  in_wishlist?: boolean;

  @Column('simple-array', { nullable: true })
  translated_languages?: string[];
  category?: Category[];
  categories?: Category[];
  tags?: Tag[];
  variations?: AttributeValue[];

  @Column('json', { nullable: true })
  variation_options?: any[];
  related_products?: Product[];

  orders?: Order[];

  @OneToMany(() => Review, (review) => review.product)
  reviews?: Review[];

  @OneToMany(() => Question, (question) => question.product)
  questions?: Question[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
  wishlists?: Wishlist[];

  @Column({ nullable: true })
  visibility?: string;
}