import { Tag } from '../entities/tag.entity';
import { Paginator } from "../../common/dto/paginator.dto";
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {QueryTagsOrderByColumn} from "../../../common/enums/enums";

export class TagPaginator extends Paginator<Tag> {}

export class GetTagsDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryTagsOrderByColumn,
        example: QueryTagsOrderByColumn.NAME
    })
    @IsOptional()
    @IsEnum(QueryTagsOrderByColumn)
    orderBy?: QueryTagsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.ASC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search text', example: 'electronics' })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiPropertyOptional({ description: 'Tag name', example: 'Electronics' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Has type filter', example: 'true' })
    @IsOptional()
    @IsString()
    hasType?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Search query', example: 'electronics' })
    @IsOptional()
    @IsString()
    search?: string;
}

