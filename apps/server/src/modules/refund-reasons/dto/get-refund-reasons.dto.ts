import { RefundReason } from '../entities/refund-reasons.entity';
import {Paginator} from "../../common/dto/paginator.dto";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";
import {SortOrder} from "../../common/dto/generic-conditions.dto";

export class RefundReasonPaginator extends Paginator<RefundReason> {
  // data: RefundReason[];
}

export class GetRefundReasonDto extends PaginationArgs {
  orderBy?: QueryReviewsOrderByColumn;
  // sortedBy?: SortOrder;
  search?: string;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'name',
}
