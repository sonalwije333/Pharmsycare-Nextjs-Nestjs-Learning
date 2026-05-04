import { ApiProperty } from '@nestjs/swagger';

export enum FaqType {
  GLOBAL = 'global',
  SHOP = 'shop',
}

export enum FaqOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  FAQ_TITLE = 'faq_title',
  FAQ_DESCRIPTION = 'faq_description',
}