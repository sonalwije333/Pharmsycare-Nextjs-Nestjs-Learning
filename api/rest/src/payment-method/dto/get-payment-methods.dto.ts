// payment-method/dto/get-payment-methods.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { PaymentMethod } from '../entities/payment-method.entity';

export class PaymentMethodPaginator extends Paginator<PaymentMethod> {
  @ApiProperty({ type: [PaymentMethod] })
  data: PaymentMethod[];
}

export class GetPaymentMethodsDto extends PaginationArgs {
  @ApiProperty({ description: 'Search text', required: false })
  text?: string;

  @ApiProperty({ description: 'Filter by default card', required: false })
  default_card?: boolean;
}