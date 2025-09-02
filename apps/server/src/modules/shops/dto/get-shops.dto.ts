import {Paginator} from "../../common/dto/paginator.dto";
import {Shop} from "../entites/shop.entity";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";


export class ShopPaginator extends Paginator<Shop> {
  // data: Shop[];
}

export class GetShopsDto extends PaginationArgs {
  orderBy?: string;
  search?: string;
  // sortedBy?: string;
  is_active?: boolean;
}
