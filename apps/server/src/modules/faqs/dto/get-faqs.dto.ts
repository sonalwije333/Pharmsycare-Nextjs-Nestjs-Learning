import {Paginator} from "../../common/dto/paginator.dto";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";
import {Faq} from "../entities/faq.entity";
import {SortOrder} from "../../common/dto/generic-conditions.dto";

export class FaqPaginator extends Paginator<Faq> {
  // data: Faq[];
}

export class GetFaqsDto extends PaginationArgs {
  orderBy?: QueryReviewsOrderByColumn;
  // sortedBy?: SortOrder;
  search?: string;
  faq_type?: string;
  shop_id?: number;
  issued_by?: string;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  FAQ_TITLE = 'FAQ_TITLE',
  FAQ_DESCRIPTION = 'FAQ_DESCRIPTION',
}
