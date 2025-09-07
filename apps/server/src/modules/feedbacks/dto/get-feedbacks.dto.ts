import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { Feedback } from "../entities/feedback.entity";
import { Paginator } from "../../common/dto/paginator.dto";

export class FeedbackPaginator extends Paginator<Feedback> {}

export enum QueryFeedbacksOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
    MODEL_TYPE = 'MODEL_TYPE',
}

export class GetFeedbacksDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryFeedbacksOrderByColumn,
        example: QueryFeedbacksOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryFeedbacksOrderByColumn)
    orderBy?: QueryFeedbacksOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Model type filter', example: 'Product' })
    @IsOptional()
    @IsString()
    model_type?: string;

    @ApiPropertyOptional({ description: 'Model ID filter', example: 'product-123' })
    @IsOptional()
    @IsString()
    model_id?: string;

    @ApiPropertyOptional({ description: 'User ID filter', example: 'user-123' })
    @IsOptional()
    @IsString()
    user_id?: string;

    @ApiPropertyOptional({ description: 'Positive feedback filter', example: true })
    @IsOptional()
    @IsBoolean()
    positive?: boolean;

    @ApiPropertyOptional({ description: 'Negative feedback filter', example: false })
    @IsOptional()
    @IsBoolean()
    negative?: boolean;
}