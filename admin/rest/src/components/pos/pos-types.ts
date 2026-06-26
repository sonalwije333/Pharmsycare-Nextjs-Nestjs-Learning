import { Product } from '@/types';

export interface PosCartItem {
  id: string;
  name: string;
  image?: string;
  unit?: string;
  sku?: string;
  price: number;
  basePrice: number;
  stock?: number;
  quantity: number;
}

export interface PosCustomer {
  id: number;
  name: string;
  email?: string;
}

export type DiscountType = 'percent' | 'flat';

export interface HeldOrder {
  id: string;
  reference: string;
  items: PosCartItem[];
  customer: PosCustomer | null;
  discountType: DiscountType;
  discountValue: number;
  createdAt: string;
}

export function productToCartItem(product: Product): PosCartItem {
  const effectivePrice = Number(product.sale_price ?? product.price ?? 0);
  return {
    id: String(product.id),
    name: product.name,
    image: product.image?.thumbnail ?? product.image?.original,
    unit: product.unit,
    sku: product.sku,
    price: effectivePrice,
    basePrice: Number(product.price ?? effectivePrice),
    stock:
      typeof product.quantity === 'number' ? product.quantity : undefined,
    quantity: 1,
  };
}
