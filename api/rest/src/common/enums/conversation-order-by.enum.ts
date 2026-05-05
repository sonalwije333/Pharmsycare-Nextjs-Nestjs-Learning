import { ApiProperty } from '@nestjs/swagger';

export enum ConversationOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  USER_ID = 'user_id',
  SHOP_ID = 'shop_id',
  UNSEEN = 'unseen',
}