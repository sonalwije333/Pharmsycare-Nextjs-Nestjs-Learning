import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsEnum, IsNumber, IsOptional, IsString} from 'class-validator';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { Manufacturer } from "../entities/manufacturer.entity";
import { Paginator } from "../../common/dto/paginator.dto";
import {QueryManufacturersOrderByColumn} from "../../../common/enums/enums";

export class ManufacturerPaginator extends Paginator<Manufacturer> {}

export class GetManufacturersDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryManufacturersOrderByColumn,
        example: QueryManufacturersOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryManufacturersOrderByColumn)
    orderBy?: QueryManufacturersOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'electronics' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;
}

export class GetTopManufacturersDto {
    @ApiPropertyOptional({ description: 'Limit of results', example: 10, default: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number;
}