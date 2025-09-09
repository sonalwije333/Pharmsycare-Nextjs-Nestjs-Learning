import { RefundPolicy } from '../entities/refund-policies.entity';
import { Paginator } from "../../common/dto/paginator.dto";
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import {QueryRefundPoliciesOrderByColumn} from "../../../common/enums/enums";

export class RefundPolicyPaginator extends Paginator<RefundPolicy> {
    //data: RefundPolicy[];
}

export class GetRefundPolicyDto extends PaginationArgs {
    orderBy?: QueryRefundPoliciesOrderByColumn;
    //sortedBy?: SortOrder;
    search?: string;
    language?: string;
    status?: string;
}

