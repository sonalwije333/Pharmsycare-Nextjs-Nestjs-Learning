// shipping/dto/get-shippings.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Shipping } from '../entities/shipping.entity';

export class ShippingPaginator extends Paginator<Shipping> {
  @ApiProperty({ type: [Shipping] })
  data: Shipping[];
}

export class GetShippingsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['CREATED_AT', 'UPDATED_AT', 'NAME', 'AMOUNT', 'IS_GLOBAL', 'TYPE'],
    required: false
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text in name',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by global status',
    required: false
  })
  is_global?: boolean;

  @ApiProperty({
    description: 'Filter by shipping type',
    enum: ['fixed', 'percentage', 'free'],
    required: false
  })
  type?: string;

  // @ApiProperty({
  //   description: 'Filter by shop ID',
  //   required: false
  // })
  // shop_id?: number;
}

export enum QueryShippingClassesOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
  AMOUNT = 'AMOUNT',
  IS_GLOBAL = 'IS_GLOBAL',
  TYPE = 'TYPE',
}