import { ApiPropertyOptional } from '@nestjs/swagger';
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {QueryTaxClassesOrderByColumn} from "../../../common/enums/enums";

export class GetTaxesDto {
    @ApiPropertyOptional({ description: 'Search text', example: 'VAT' })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryTaxClassesOrderByColumn,
        example: QueryTaxClassesOrderByColumn.NAME
    })
    @IsOptional()
    @IsEnum(QueryTaxClassesOrderByColumn)
    orderBy?: QueryTaxClassesOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.ASC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortedBy?: SortOrder;
}

