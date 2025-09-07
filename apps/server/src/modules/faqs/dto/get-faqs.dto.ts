import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { Faq } from "../entities/faq.entity";
import { Paginator } from "../../common/dto/paginator.dto";
import {QueryFaqsOrderByColumn} from "../../../common/enums/enums";

export class FaqPaginator extends Paginator<Faq> {}



export class GetFaqsDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryFaqsOrderByColumn,
        example: QueryFaqsOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryFaqsOrderByColumn)
    orderBy?: QueryFaqsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'password' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'FAQ type', example: 'general' })
    @IsOptional()
    @IsString()
    faq_type?: string;

    @ApiPropertyOptional({ description: 'Shop ID', example: 'shop-123' })
    @IsOptional()
    @IsString()
    shop_id?: string;

    @ApiPropertyOptional({ description: 'Issued by', example: 'admin' })
    @IsOptional()
    @IsString()
    issued_by?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;
}