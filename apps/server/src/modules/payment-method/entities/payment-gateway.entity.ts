import {CoreEntity} from "../../common/entities/core.entity";

export class PaymentGateWay extends CoreEntity {
  user_id: number;
  customer_id: string;
  gateway_name: string;
}
