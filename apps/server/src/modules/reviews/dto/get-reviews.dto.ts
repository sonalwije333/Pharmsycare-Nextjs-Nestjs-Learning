import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { Review } from "../entities/review.entity";
import { Paginator } from "../../common/dto/paginator.dto";
import {QueryReviewsOrderByColumn} from "../../../common/enums/enums";


export class ReviewPaginator extends Paginator<Review> {}

export class GetReviewsDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryReviewsOrderByColumn,
        example: QueryReviewsOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryReviewsOrderByColumn)
    orderBy?: QueryReviewsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'excellent' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Product ID filter', example: 'product-123' })
    @IsOptional()
    @IsString()
    product_id?: string;

    @ApiPropertyOptional({ description: 'Shop ID filter', example: 'shop-123' })
    @IsOptional()
    @IsString()
    shop_id?: string;

    @ApiPropertyOptional({ description: 'Minimum rating', example: 4 })
    @IsOptional()
    @IsNumber()
    rating_min?: number;

    @ApiPropertyOptional({ description: 'Maximum rating', example: 5 })
    @IsOptional()
    @IsNumber()
    rating_max?: number;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;
}