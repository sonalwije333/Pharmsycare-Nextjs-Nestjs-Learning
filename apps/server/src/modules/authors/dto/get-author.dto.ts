import { Author } from '../entities/author.entity';
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { Paginator } from "../../common/dto/paginator.dto";
import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsEnum, IsOptional, IsString, IsNumber, IsBoolean} from 'class-validator';
import {QueryAuthorsOrderByColumn} from "../../../common/enums/enums";

export class AuthorPaginator extends Paginator<Author> {}

export class GetAuthorDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryAuthorsOrderByColumn,
        example: QueryAuthorsOrderByColumn.NAME
    })
    @IsOptional()
    @IsEnum(QueryAuthorsOrderByColumn)
    orderBy?: QueryAuthorsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'john' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Is approved', example: true })
    @IsOptional()
    @IsBoolean()
    is_approved?: boolean;

    @ApiPropertyOptional({ description: 'Shop ID', example: 'shop-123' })
    @IsOptional()
    @IsString()
    shop_id?: string;
}

export class GetTopAuthorsDto {
    @ApiPropertyOptional({ description: 'Limit', example: 10, default: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number;
}