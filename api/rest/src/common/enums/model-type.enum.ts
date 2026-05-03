import { ApiProperty } from '@nestjs/swagger';

export enum ModelType {
  PRODUCT = 'product',
  ORDER = 'order',
  SHOP = 'shop',
}

export enum FeedbackOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  MODEL_TYPE = 'model_type',
  MODEL_ID = 'model_id',
}