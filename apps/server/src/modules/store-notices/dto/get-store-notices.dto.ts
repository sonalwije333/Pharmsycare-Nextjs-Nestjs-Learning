import { StoreNotice } from '../entities/store-notices.entity';
import {Paginator} from "../../common/dto/paginator.dto";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";
import {SortOrder} from "../../common/dto/generic-conditions.dto";

export class StoreNoticePaginator extends Paginator<StoreNotice> {
  // data: StoreNotice[];
}

export class GetStoreNoticesDto extends PaginationArgs {
  orderBy?: QueryStoreNoticesOrderByColumn;
  // sortedBy?: SortOrder;
  search?: string;
  language?: string;
}

export enum QueryStoreNoticesOrderByColumn {
  NOTICE = 'NOTICE',
  DESCRIPTION = 'DESCRIPTION',
  TYPE = 'TYPE',
  PRIORITY = 'PRIORITY',
  EXPIRE_AT = 'EXPIRE_AT',
}
