import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { NotifyLogs } from "../entities/notify-logs.entity";
import { Paginator } from "../../common/dto/paginator.dto";
import {QueryNotifyLogsOrderByColumn} from "../../../common/enums/enums";

export class NotifyLogsPaginator extends Paginator<NotifyLogs> {}

export class GetNotifyLogsDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryNotifyLogsOrderByColumn,
        example: QueryNotifyLogsOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryNotifyLogsOrderByColumn)
    orderBy?: QueryNotifyLogsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'notification' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Receiver ID', example: 'user-123' })
    @IsOptional()
    @IsString()
    receiver?: string;

    @ApiPropertyOptional({ description: 'Notification type', example: 'alert' })
    @IsOptional()
    @IsString()
    notify_type?: string;

    @ApiPropertyOptional({ description: 'Read status', example: false })
    @IsOptional()
    @IsBoolean()
    is_read?: boolean;
}