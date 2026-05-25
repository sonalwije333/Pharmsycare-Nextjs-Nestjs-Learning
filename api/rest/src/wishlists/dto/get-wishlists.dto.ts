// wishlists/dto/get-wishlists.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Wishlist } from '../entities/wishlist.entity';

export class WishlistPaginator extends Paginator<Wishlist> {
  @ApiProperty({ type: [Wishlist] })
  data: Wishlist[];
}

export class GetWishlistDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['NAME', 'CREATED_AT', 'UPDATED_AT'],
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
    description: 'Search text',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false
  })
  user_id?: number;
}

export enum QueryReviewsOrderByColumn {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}