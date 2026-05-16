import { ApiProperty } from '@nestjs/swagger';

export enum MessageOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  ID = 'id',
}