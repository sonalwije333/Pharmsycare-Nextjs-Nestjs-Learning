import { ApiProperty } from '@nestjs/swagger';

export enum CategoryOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  NAME = 'name',
}