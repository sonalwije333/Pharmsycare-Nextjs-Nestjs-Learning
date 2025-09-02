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