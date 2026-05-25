// store-notices/dto/get-store-notices.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { StoreNotice } from '../entities/store-notices.entity';

export class StoreNoticePaginator extends Paginator<StoreNotice> {
  @ApiProperty({ type: [StoreNotice] })
  data: StoreNotice[];
}

export class GetStoreNoticesDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Order by field',
    enum: ['NOTICE', 'DESCRIPTION', 'TYPE', 'PRIORITY', 'EXPIRE_AT'],
    required: false
  })
  orderBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search text in notice or description',
    required: false
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search join operator',
    required: false,
    default: 'and',
  })
  searchJoin?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Language code',
    required: false,
    default: 'en',
  })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by priority',
    enum: ['high', 'medium', 'low'],
    required: false
  })
  priority?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Filter by type',
    required: false
  })
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Filter by user ID (notifications for this user)',
    required: false
  })
  user_id?: number;
}

export enum QueryStoreNoticesOrderByColumn {
  NOTICE = 'NOTICE',
  DESCRIPTION = 'DESCRIPTION',
  TYPE = 'TYPE',
  PRIORITY = 'PRIORITY',
  EXPIRE_AT = 'EXPIRE_AT',
}