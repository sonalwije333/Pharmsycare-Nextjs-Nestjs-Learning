import { ApiProperty } from '@nestjs/swagger';

export enum AuthorOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  NAME = 'name',
}