import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { FlashSale } from "../entities/flash-sale.entity";
import { Paginator } from "../../common/dto/paginator.dto";

export class FlashSalePaginator extends Paginator<FlashSale> {}

export enum QueryFlashSalesOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    TITLE = 'TITLE',
    DESCRIPTION = 'DESCRIPTION',
    START_DATE = 'START_DATE',
    END_DATE = 'END_DATE',
}

export class GetFlashSaleDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryFlashSalesOrderByColumn,
        example: QueryFlashSalesOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryFlashSalesOrderByColumn)
    orderBy?: QueryFlashSalesOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'summer' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Sale status filter', example: true })
    @IsOptional()
    @IsString()
    sale_status?: boolean;
}