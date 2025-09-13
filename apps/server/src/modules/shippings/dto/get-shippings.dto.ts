import { ApiPropertyOptional } from '@nestjs/swagger';
import {IsOptional, IsString, IsEnum, IsBoolean} from 'class-validator';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { Shipping } from '../entities/shipping.entity';
import { Paginator } from '../../common/dto/paginator.dto';
import {QueryShippingClassesOrderByColumn, ShippingType} from "../../../common/enums/enums";

export class ShippingPaginator extends Paginator<Shipping> {}

export class GetShippingsDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryShippingClassesOrderByColumn,
        example: QueryShippingClassesOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryShippingClassesOrderByColumn)
    orderBy?: QueryShippingClassesOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'standard' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Shipping type',
        enum: ShippingType,
        example: ShippingType.FIXED
    })
    @IsOptional()
    @IsEnum(ShippingType)
    type?: ShippingType;

    @ApiPropertyOptional({ description: 'Is global shipping', example: true })
    @IsOptional()
    @IsBoolean()
    is_global?: boolean;
}