// flash-sale/dto/get-flash-sales.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { FlashSale } from '../entities/flash-sale.entity';
import { QueryFlashSaleOrderByColumn } from '../../common/enums/enums';

export class FlashSalePaginator {
  @ApiProperty({ type: [FlashSale] })
  data: FlashSale[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 30 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/flash-sale?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/flash-sale?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/flash-sale?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/flash-sale?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 30 })
  to: number;
}

export class GetFlashSaleDto extends PaginationArgs {
  @ApiProperty({ enum: QueryFlashSaleOrderByColumn, required: false })
  orderBy?: QueryFlashSaleOrderByColumn;

  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.DESC })
  sortedBy?: SortOrder;

  @ApiProperty({ required: false })
  search?: string;

  @ApiProperty({ required: false, default: 'en' })
  language?: string;

  @ApiProperty({ required: false })
  type?: string;

  @ApiProperty({ required: false })
  sale_status?: boolean;
}
