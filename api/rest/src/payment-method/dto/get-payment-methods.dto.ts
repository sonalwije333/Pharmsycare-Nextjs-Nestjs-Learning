import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentMethodType, PaymentMethodOrderByColumn } from 'src/common/enums/payment-method.enum';

export class PaymentMethodPaginator {
  @ApiProperty({ type: () => [PaymentMethod], description: 'Array of payment methods' })
  data: PaymentMethod[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/cards?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/cards?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/cards?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/cards?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetPaymentMethodsDto extends PaginationArgs {
  @ApiProperty({ description: 'Search text', required: false, type: String })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ description: 'Filter by default card', required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  default_card?: boolean;

  @ApiProperty({ description: 'Filter by user ID', required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'Filter by payment type', enum: PaymentMethodType, required: false })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;

  @ApiProperty({ description: 'Order by column', enum: PaymentMethodOrderByColumn, required: false })
  @IsOptional()
  @IsEnum(PaymentMethodOrderByColumn)
  orderBy?: PaymentMethodOrderByColumn = PaymentMethodOrderByColumn.CREATED_AT;

  @ApiProperty({ description: 'Sort order', enum: SortOrder, required: false, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;
}