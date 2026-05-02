// manufacturers/dto/get-manufactures.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Manufacturer } from '../entities/manufacturer.entity';

export class ManufacturerPaginator extends Paginator<Manufacturer> {
  @ApiProperty({ type: [Manufacturer] })
  data: Manufacturer[];
}

export class GetManufacturersDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: ['CREATED_AT', 'NAME', 'UPDATED_AT'],
    required: false
  })
  orderBy?: QueryManufacturersOrderByColumn;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC
  })
  sortedBy?: SortOrder;

  @ApiProperty({
    description: 'Search term',
    example: 'publication',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false
  })
  language?: string;

  @ApiProperty({
    description: 'Filter by approval status',
    example: true,
    required: false
  })
  is_approved?: boolean;
}

export enum QueryManufacturersOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}