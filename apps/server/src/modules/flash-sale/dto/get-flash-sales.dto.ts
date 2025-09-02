import { FlashSale } from '../entities/flash-sale.entity';
import {Paginator} from "../../common/dto/paginator.dto";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";
import {SortOrder} from "../../common/dto/generic-conditions.dto";

export class FlashSalePaginator extends Paginator<FlashSale> {
  // data: FlashSale[];
}

export class GetFlashSaleDto extends PaginationArgs {
  orderBy?: QueryReviewsOrderByColumn;
  // sortedBy?: SortOrder;
  search?: string;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TITLE = 'TITLE',
  DESCRIPTION = 'DESCRIPTION',
}
