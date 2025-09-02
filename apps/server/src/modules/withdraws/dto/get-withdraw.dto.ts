import { Withdraw } from '../entities/withdraw.entity';
import {Paginator} from "../../common/dto/paginator.dto";
import {PaginationArgs} from "../../common/dto/pagination-args.dto";

export class WithdrawPaginator extends Paginator<Withdraw> {
  // data: Withdraw[];
}

export class GetWithdrawsDto extends PaginationArgs {
  orderBy?: string;
  // sortedBy?: string;
  status?: string;
  shop_id?: number;
}
