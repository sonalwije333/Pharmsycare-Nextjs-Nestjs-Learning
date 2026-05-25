import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { IsOptional, IsString, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class Setting extends CoreEntity {
  options: SettingsOptions;
  language: string;
  translated_languages: string[];
}

export class PopUpNotShow {
  title?: string;
  popUpExpiredIn?: number;
}

export class PromoPopup {
  image?: Attachment;
  title?: string;
  description?: string;
  popUpDelay?: number;
  popUpExpiredIn?: number;
  isPopUpNotShow?: boolean;
  popUpNotShow?: PopUpNotShow;
}

export class SettingsOptions {
  contactDetails: ContactDetails;
  currency: string;
  currencyOptions: CurrencyOptions;
  currencyToWalletRatio: number;
  defaultAi: string;
  defaultPaymentGateway: string;
  deliveryTime: DeliveryTime[];
  emailEvent: EmailEvent;
  freeShipping: boolean;
  freeShippingAmount: any;
  guestCheckout: boolean;
  isProductReview: boolean;
  logo: LogoSettings;
  maximumQuestionLimit: number;
  maxShopDistance: number;
  minimumOrderAmount: number;
  paymentGateway: PaymentGateway[];
  seo: SeoSettings;
  server_info: ServerInfo;
  shippingClass: number;
  signupPoints: number;
  siteSubtitle: string;
  siteTitle: string;
  smsEvent: SmsEvent;
  StripeCardOnly: boolean;
  taxClass: number;
  useAi: boolean;
  useCashOnDelivery: boolean;
  useEnableGateway: boolean;
  useGoogleMap: boolean;
  useMustVerifyEmail: boolean;
  useOtp: boolean;
  isUnderMaintenance: boolean;
  isPromoPopUp?: boolean;
  promoPopup?: PromoPopup;
  isMultiCommissionRate: boolean;
  enableTerms?: boolean;
  enableCoupons?: boolean;
  maintenance: Maintenance;
  enableEmailForDigitalProduct?: boolean;
  reviewSystem?: string;
}

export interface Maintenance {
  image: Attachment;
  title: string;
  description: string;
  start: string;
  until: string;
  isUnderMaintenance: boolean;
}

export class DeliveryTime {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

export class LogoSettings {
  @IsString()
  id: string;

  @IsString()
  original: string;

  @IsString()
  thumbnail: string;
}

export class SeoSettings {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Attachment)
  ogImage?: Attachment;

  @IsOptional()
  @IsString()
  twitterHandle?: string;

  @IsOptional()
  @IsString()
  twitterCardType?: string;

  @IsOptional()
  @IsString()
  metaTags?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;
}

export class GoogleSettings {
  isEnable: boolean;
  tagManagerId: string;
}

export class FacebookSettings {
  isEnable: boolean;
  appId: string;
  pageId: string;
}

export class ShopSocials {
  @IsString()
  icon: string;

  @IsString()
  url: string;
}

export class Location {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsString()
  formattedAddress: string;
}

export class ContactDetails {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ShopSocials)
  socials: ShopSocials[];

  @IsOptional()
  @IsString()
  contact: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Location)
  location: Location;

  @IsOptional()
  @IsString()
  website: string;
}

export class SmsEvent {
  admin: SmsAdmin;
  vendor: SmsVendor;
  customer: SmsCustomer;
}
export class SmsAdmin {
  refundOrder: boolean;
  paymentOrder: boolean;
  statusChangeOrder: boolean;
}

export class SmsVendor {
  refundOrder: boolean;
  paymentOrder: boolean;
  statusChangeOrder: boolean;
}

export class SmsCustomer {
  refundOrder: boolean;
  paymentOrder: boolean;
  statusChangeOrder: boolean;
}

export class EmailEvent {
  admin: EmailAdmin;
  vendor: EmailVendor;
  customer: EmailCustomer;
}
export class EmailAdmin {
  refundOrder: boolean;
  paymentOrder: boolean;
  statusChangeOrder: boolean;
}

export class EmailVendor {
  refundOrder: boolean;
  createReview: boolean;
  paymentOrder: boolean;
  createQuestion: boolean;
  statusChangeOrder: boolean;
}

export class EmailCustomer {
  refundOrder: boolean;
  paymentOrder: boolean;
  answerQuestion: boolean;
  statusChangeOrder: boolean;
}
export class ServerInfo {
  memory_limit: string;
  post_max_size: number;
  max_input_time: string;
  max_execution_time: string;
  upload_max_filesize: number;
}
export class PaymentGateway {
  name: string;
  title: string;
}
export class CurrencyOptions {
  formation: string;
  fractions: number;
}
