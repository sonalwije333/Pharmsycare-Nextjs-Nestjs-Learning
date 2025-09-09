export enum PermissionType {
  SUPER_ADMIN = 'super_admin',
  STORE_OWNER = 'store_owner',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

export enum QueryUsersOrderByColumn {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  IS_ACTIVE = 'IS_ACTIVE',
}

export enum AiStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PROCESSING = 'processing',
}

export enum QueryAiOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  STATUS = 'STATUS',
}

export enum AiTaskType {
  DESCRIPTION_GENERATION = 'description_generation',
  IMAGE_GENERATION = 'image_generation',
  CONTENT_SUMMARY = 'content_summary',
  TRANSLATION = 'translation',
}
export enum AnalyticsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum QueryAuthorsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    NAME = 'NAME',
    UPDATED_AT = 'UPDATED_AT',
    PRODUCTS_COUNT = 'PRODUCTS_COUNT',
}

export enum CouponType {
    FIXED_COUPON = 'fixed',
    PERCENTAGE_COUPON = 'percentage',
    FREE_SHIPPING_COUPON = 'free_shipping',
    DEFAULT_COUPON = 'default',
}
export enum QueryCouponsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    EXPIRE_AT = 'EXPIRE_AT',
    ID = 'ID',
    CODE = 'CODE',
    AMOUNT = 'AMOUNT',
    TITLE = 'TITLE',
    DESCRIPTION = 'DESCRIPTION',
    MINIMUM_CART_AMOUNT = 'MINIMUM_CART_AMOUNT',
    IS_APPROVE = 'IS_APPROVE',
    TYPE = 'TYPE',
}
export enum QueryFaqsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    FAQ_TITLE = 'FAQ_TITLE',
    FAQ_DESCRIPTION = 'FAQ_DESCRIPTION',
}
export enum QueryManufacturersOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    NAME = 'NAME',
}
export enum QueryNotifyLogsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
}
export enum QueryQuestionsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    QUESTION = 'QUESTION',
    ANSWER = 'ANSWER',
}
export enum QueryRefundPoliciesOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    TITLE = 'TITLE',
    STATUS = 'STATUS',
}

export enum QueryRefundReasonsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    NAME = 'NAME',
}