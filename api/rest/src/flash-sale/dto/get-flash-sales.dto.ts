import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { FlashSale } from '../entities/flash-sale.entity';
import { FlashSaleOrderByColumn, FlashSaleType } from 'src/common/enums/flash-sale.enum';
import { SortOrder } from 'src/common/enums/enums';

export class FlashSalePaginator {
  @ApiProperty({ type: () => [FlashSale], description: 'Array of flash sales' })
  data: FlashSale[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/flash-sale?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/flash-sale?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/flash-sale?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/flash-sale?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetFlashSaleDto extends PaginationArgs {
  @ApiProperty({ 
    enum: FlashSaleOrderByColumn, 
    required: false, 
    default: FlashSaleOrderByColumn.CREATED_AT,
    description: 'Column to order by',
  })
  @IsOptional()
  @IsEnum(FlashSaleOrderByColumn)
  orderBy?: FlashSaleOrderByColumn = FlashSaleOrderByColumn.CREATED_AT;

  @ApiProperty({ 
    enum: SortOrder, 
    required: false, 
    default: SortOrder.DESC,
    description: 'Sort direction',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;

  @ApiProperty({ 
    required: false, 
    type: String,
    description: 'Search term',
    example: 'Limited-Time',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    required: false, 
    default: 'en',
    type: String,
    description: 'Language code',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @ApiProperty({ 
    required: false, 
    enum: FlashSaleType,
    description: 'Filter by flash sale type',
    example: FlashSaleType.PERCENTAGE,
  })
  @IsOptional()
  @IsEnum(FlashSaleType)
  type?: FlashSaleType;

  @ApiProperty({ 
    required: false, 
    type: Boolean,
    description: 'Filter by sale status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  sale_status?: boolean;
}
