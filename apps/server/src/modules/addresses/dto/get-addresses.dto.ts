import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryAddressesOrderByColumn, AddressType } from 'src/common/enums/enums';
import { SortOrder } from 'src/modules/common/dto/generic-conditions.dto';

export class GetAddressesDto {
  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsEnum(SortOrder)
  @IsOptional()
  sortedBy?: SortOrder;

  @ApiPropertyOptional({ enum: QueryAddressesOrderByColumn, default: QueryAddressesOrderByColumn.CREATED_AT })
  @IsEnum(QueryAddressesOrderByColumn)
  @IsOptional()
  orderBy?: QueryAddressesOrderByColumn;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  text?: string;

  @ApiPropertyOptional({ enum: AddressType })
  @IsEnum(AddressType)
  @IsOptional()
  type?: AddressType;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  customer_id?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}