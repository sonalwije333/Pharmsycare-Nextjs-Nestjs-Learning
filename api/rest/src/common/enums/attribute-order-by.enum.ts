import { ApiProperty } from '@nestjs/swagger';

export enum AttributeOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  NAME = 'name',
}