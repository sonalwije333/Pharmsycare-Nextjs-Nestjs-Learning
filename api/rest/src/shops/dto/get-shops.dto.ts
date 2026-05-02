// shops/dto/get-shops.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Shop } from '../entities/shop.entity';

export class ShopPaginator extends Paginator<Shop> {
  @ApiProperty({ type: [Shop] })
  data: Shop[];
}

export class GetShopsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['name', 'created_at', 'updated_at', 'orders_count', 'products_count'],
    required: false
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text in name or description',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by active status',
    required: false
  })
  is_active?: boolean;

  @ApiProperty({
    description: 'Filter by owner ID',
    required: false
  })
  owner_id?: number;
}