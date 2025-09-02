import { TermsAndConditions } from '../entities/terms-and-conditions.entity';
import {Paginator} from "../../common/dto/paginator.dto";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";
import {SortOrder} from "../../common/dto/generic-conditions.dto";

export class TermsAndConditionsPaginator extends Paginator<TermsAndConditions> {
  // data: TermsAndConditions[];
}

export class GetTermsAndConditionsDto extends PaginationArgs {
  orderBy?: QueryReviewsOrderByColumn;
  // sortedBy?: SortOrder;
  search?: string;
  type?: string;
  issued_by?: string;
  is_approved?: boolean;
  language?: string;
  // searchJoin?: string;
  shop_id?: number;
}

export enum QueryReviewsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TITLE = 'TITLE',
  DESCRIPTION = 'DESCRIPTION',
}
