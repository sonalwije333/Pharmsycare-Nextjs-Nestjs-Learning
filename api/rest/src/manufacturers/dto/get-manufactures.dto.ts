import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/common/enums/enums';
import { Manufacturer } from '../entities/manufacturer.entity';
import { ManufacturerOrderByColumn } from 'src/common/enums/manufacturer-order-by.enum';

export class ManufacturerPaginator {
  @ApiProperty({ type: () => [Manufacturer], description: 'Array of manufacturers' })
  data: Manufacturer[];

  @ApiProperty({ example: 1, type: Number, description: 'Current page number' })
  current_page: number;

  @ApiProperty({ example: 30, type: Number, description: 'Items per page' })
  per_page: number;

  @ApiProperty({ example: 100, type: Number, description: 'Total items count' })
  total: number;

  @ApiProperty({ example: 10, type: Number, description: 'Last page number' })
  last_page: number;

  @ApiProperty({ example: '/manufacturers?page=1', type: String, description: 'First page URL' })
  first_page_url: string;

  @ApiProperty({ example: '/manufacturers?page=10', type: String, description: 'Last page URL' })
  last_page_url: string;

  @ApiProperty({ example: '/manufacturers?page=2', nullable: true, type: String, description: 'Next page URL' })
  next_page_url: string | null;

  @ApiProperty({ example: '/manufacturers?page=1', nullable: true, type: String, description: 'Previous page URL' })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, type: Number, description: 'Starting item index' })
  from: number;

  @ApiProperty({ example: 30, type: Number, description: 'Ending item index' })
  to: number;
}

export class GetManufacturersDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: ManufacturerOrderByColumn,
    required: false,
    default: ManufacturerOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ManufacturerOrderByColumn)
  orderBy?: ManufacturerOrderByColumn = ManufacturerOrderByColumn.CREATED_AT;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;

  @ApiProperty({
    description: 'Search term',
    example: 'publication',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @ApiProperty({
    description: 'Filter by approval status',
    example: true,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_approved?: boolean;
}