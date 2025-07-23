import { Paginator } from 'src/modules/common/dto/paginator.dto';
import { Manufacturer } from '../entities/manufacturer.entity';
import { PaginationArgs } from 'src/modules/common/dto/pagination-args.dto';
import { IsOptional, IsString } from 'class-validator';

export class ManufacturerPaginator extends Paginator<Manufacturer> {}

export class GetManufacturersDto extends PaginationArgs {
  @IsOptional()
  orderBy?: QueryManufacturersOrderByColumn;
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @IsString()
  language?: string;
}

export enum QueryManufacturersOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
}
