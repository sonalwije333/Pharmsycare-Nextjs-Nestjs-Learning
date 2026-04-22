// common/enums/enums.ts
export enum Permission {
  SUPER_ADMIN = 'super_admin',
  STORE_OWNER = 'store_owner',
  STAFF = 'staff',
  CUSTOMER = 'customer'
}

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping'
}

export enum SQLOperator {
  EQ = 'EQ',
  NEQ = 'NEQ',
  GT = 'GT'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum QueryUsersOrderByColumn {
  NAME = 'name',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  IS_ACTIVE = 'IS_ACTIVE',
}

export enum QueryAttributesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}

export enum QueryAuthorsOrderByColumn {
  CREATED_AT = 'created_at',
  NAME = 'name',
  UPDATED_AT = 'updated_at',
}

export enum QueryCategoriesOrderByColumn {
  CREATED_AT = 'created_at',
  NAME = 'name',
  SLUG = 'slug',
  UPDATED_AT = 'updated_at',
}

export enum QueryCouponsOrderByColumn {
  CREATED_AT = 'created_at',
  EXPIRE_AT = 'expire_at',
  ID = 'id',
  CODE = 'code',
  AMOUNT = 'amount',
  NAME = 'title',
  DESCRIPTION = 'description',
  MINIMUM_CART_AMOUNT = 'minimum_cart_amount',
  IS_APPROVE = 'is_approve',
  TYPE = 'type',
}

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
}

export enum QueryFaqsOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  FAQ_TITLE = 'faq_title',
  FAQ_DESCRIPTION = 'faq_description',
}

export enum QueryFlashSaleOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  TITLE = 'title',
  START_DATE = 'start_date',
  END_DATE = 'end_date',
}