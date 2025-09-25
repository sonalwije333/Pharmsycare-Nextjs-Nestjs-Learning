import {Column, Entity} from "typeorm";
import {CoreEntity} from "../../modules/common/entities/core.entity";
import {ApiProperty} from "@nestjs/swagger";
import {SortOrder} from "../../modules/common/dto/generic-conditions.dto";


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
export enum QueryReportsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    NAME = 'NAME',
}

export enum QueryReviewsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    NAME = 'NAME',
}
export enum ShippingType {
    FIXED = 'fixed',
    PERCENTAGE = 'percentage',
    FREE = 'free',
}
export enum QueryShippingClassesOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    NAME = 'NAME',
    AMOUNT = 'AMOUNT',
    IS_GLOBAL = 'IS_GLOBAL',
    TYPE = 'TYPE',
}
export enum QueryShopsOrderByColumn {
    NAME = 'NAME',
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    IS_ACTIVE = 'IS_ACTIVE',
    BALANCE = 'BALANCE',
}
export enum QueryStoreNoticesOrderByColumn {
    NOTICE = 'NOTICE',
    DESCRIPTION = 'DESCRIPTION',
    TYPE = 'TYPE',
    PRIORITY = 'PRIORITY',
    EXPIRED_AT = 'EXPIRED_AT',
    CREATED_AT = 'CREATED_AT',
}
export enum StoreNoticePriorityType {
    High = 'high',
    Medium = 'medium',
    Low = 'low',
}

export enum StoreNoticeType {
    ALL_SHOP = 'all_shop',
    SPECIFIC_SHOP = 'specific_shop',
    ALL_VENDOR = 'all_vendor',
    SPECIFIC_VENDOR = 'specific_vendor',
}
export enum QueryTagsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    NAME = 'NAME',
    UPDATED_AT = 'UPDATED_AT',
}
export enum QueryTaxClassesOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    NAME = 'NAME',
    RATE = 'RATE',
    COUNTRY = 'COUNTRY',
    STATE = 'STATE',
}
export enum QueryTermsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    TITLE = 'TITLE',
    UPDATED_AT = 'UPDATED_AT',
    IS_APPROVED = 'IS_APPROVED',
}
export class QueryTypesOrderByOrderByClause {
    column: QueryTypesOrderByColumn;
    order: SortOrder;
}

export enum QueryTypesOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    NAME = 'NAME',
    UPDATED_AT = 'UPDATED_AT',
}
export enum WithdrawStatus {
    APPROVED = 'Approved',
    PENDING = 'Pending',
    ON_HOLD = 'On hold',
    REJECTED = 'Rejected',
    PROCESSING = 'Processing',
}
export enum QueryProductsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    NAME = 'NAME',
    UPDATED_AT = 'UPDATED_AT',
    PRICE = 'PRICE',
    SALE_PRICE = 'SALE_PRICE',
    STATUS = 'STATUS'
}

export enum ProductStatus {
    PUBLISH = 'publish',
    DRAFT = 'draft',
    PENDING = 'pending'
}

export enum ProductType {
    SIMPLE = 'simple',
    VARIABLE = 'variable'
}

