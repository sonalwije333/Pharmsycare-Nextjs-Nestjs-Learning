import { RefundReason } from '../entities/refund-reasons.entity';
import { Paginator } from "../../common/dto/paginator.dto";
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import {QueryRefundReasonsOrderByColumn} from "../../../common/enums/enums";

export class RefundReasonPaginator extends Paginator<RefundReason> {
    // data: RefundReason[]; // Inherited from base class
}
export class GetRefundReasonDto extends PaginationArgs {
    orderBy?: QueryRefundReasonsOrderByColumn;
    search?: string;
    language?: string;
}

