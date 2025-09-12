import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { Report } from "../entities/reports.entity";
import { Paginator } from "../../common/dto/paginator.dto";
import {QueryReportsOrderByColumn} from "../../../common/enums/enums";

export class ReportPaginator extends Paginator<Report> {}

export class GetReportsDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryReportsOrderByColumn,
        example: QueryReportsOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryReportsOrderByColumn)
    orderBy?: QueryReportsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'inappropriate' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Model type filter', example: 'review' })
    @IsOptional()
    @IsString()
    model_type?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;
}