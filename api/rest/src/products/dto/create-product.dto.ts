// dto/create-product.dto.ts
import { OmitType } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export class CreateProductDto extends OmitType(Product, [
  'id',
  'slug',
  'created_at',
  'updated_at',
  'status',
  'in_stock',
  'is_taxable',
  'in_flash_sale',
  'is_digital',
  'is_external',
  'language',
  'categories',
  'tags',
  'type',
  'related_products',
  'translated_languages',
  'rating_count',
  'my_review',
  'in_wishlist',
  'orders_count',
  'ratings',
  'total_reviews',
  'blocked_dates',
  'video',
]) {
  categories: number[];
  tags: number[];
  name: string;
  status?: Product['status'];
  in_stock?: number;
  is_taxable?: number;
  in_flash_sale?: number;
  is_digital?: number;
  is_external?: number;
  language?: string;
  type_id: number;
  // shop_id: number; // Commented for future use
  gallery?: any[];
  image?: any;
  variations?: any[];
}