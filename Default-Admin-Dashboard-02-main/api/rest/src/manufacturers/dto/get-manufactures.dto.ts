// manufacturers/dto/get-manufactures.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Manufacturer } from '../entities/manufacturer.entity';

export class ManufacturerPaginator extends Paginator<Manufacturer> {
  @ApiProperty({ type: [Manufacturer] })
  data: Manufacturer[];
}

export enum QueryManufacturersOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}

export class GetManufacturersDto extends PaginationArgs {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Order by column',
    enum: ['created_at', 'name', 'updated_at'],
    required: false
  })
  orderBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc'
  })
  sortedBy?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Search term',
    example: 'publication',
    required: false
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false
  })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Join condition for search terms',
    required: false,
    example: 'and'
  })
  searchJoin?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Filter by approval status',
    example: true,
    required: false
  })
  is_approved?: boolean;
}