import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { MyReports } from "../entities/report.entity";
import { Paginator } from "../../common/dto/paginator.dto";
import {QueryReportsOrderByColumn} from "../../../common/enums/enums";

export class MyReportPaginator extends Paginator<MyReports> {}

export class GetMyReportDto extends PaginationArgs {
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

    @ApiPropertyOptional({ description: 'Search query', example: 'checkout issue' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Report type filter',
        enum: ['bug', 'feature', 'complaint', 'suggestion', 'other'],
        example: 'bug'
    })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({
        description: 'Status filter',
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        example: 'pending'
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({
        description: 'Priority filter',
        enum: ['low', 'medium', 'high', 'critical'],
        example: 'medium'
    })
    @IsOptional()
    @IsString()
    priority?: string;

    @ApiPropertyOptional({ description: 'User ID filter', example: 'user-123' })
    @IsOptional()
    @IsString()
    user_id?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;
}