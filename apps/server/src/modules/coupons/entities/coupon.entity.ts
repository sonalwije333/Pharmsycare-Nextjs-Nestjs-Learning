import {CoreEntity} from "../../common/entities/core.entity";
import {Attachment} from "../../common/entities/attachment.entity";

export enum CouponType {
  FIXED_COUPON = 'fixed',
  PERCENTAGE_COUPON = 'percentage',
  FREE_SHIPPING_COUPON = 'free_shipping',
  DEFAULT_COUPON = 'fixed',
}

export class Coupon extends CoreEntity {
  code: string;
  description?: string;
  minimum_cart_amount: number;
  // orders?: Order[];
  type: CouponType;
  image: Attachment;
  is_valid: boolean;
  amount: number;
  active_from: string;
  expire_at: string;
  language: string;
  translated_languages: string[];
  target?: boolean;
  shop_id?: number;
  is_approve?: boolean;
}
