import { TermsAndConditions } from '../entities/terms-and-conditions.entity';
import { Paginator } from "../../common/dto/paginator.dto";
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import {QueryTermsOrderByColumn} from "../../../common/enums/enums";

export class TermsAndConditionsPaginator extends Paginator<TermsAndConditions> {}

export class GetTermsAndConditionsDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryTermsOrderByColumn,
        example: QueryTermsOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryTermsOrderByColumn)
    orderBy?: QueryTermsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder; // Changed from sortedBy to avoid conflict

    @ApiPropertyOptional({ description: 'Search query', example: 'privacy' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Terms type', example: 'privacy' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ description: 'Issued by', example: 'Company Name' })
    @IsOptional()
    @IsString()
    issued_by?: string;

    @ApiPropertyOptional({ description: 'Is approved', example: true })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_approved?: boolean;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Shop ID', example: 1 })
    @IsOptional()
    shop_id?: number;

    @ApiPropertyOptional({ description: 'User ID', example: 'user-123' })
    @IsOptional()
    @IsString()
    user_id?: string;
}