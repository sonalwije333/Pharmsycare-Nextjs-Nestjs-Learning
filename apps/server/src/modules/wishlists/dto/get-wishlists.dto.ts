import { Wishlist } from '../entities/wishlist.entity';
import {Paginator} from "../../common/dto/paginator.dto";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";
import {SortOrder} from "../../common/dto/generic-conditions.dto";

export class WishlistPaginator extends Paginator<Wishlist> {
  // data: Wishlist[];
}

export class GetWishlistDto extends PaginationArgs {
  orderBy?: QueryReviewsOrderByColumn;
  // sortedBy?: SortOrder;
  search?: string;
}

export enum QueryReviewsOrderByColumn {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}
