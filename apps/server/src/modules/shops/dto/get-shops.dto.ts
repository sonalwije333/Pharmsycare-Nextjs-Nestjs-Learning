import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import {QueryShopsOrderByColumn} from "../../../common/enums/enums";

export class GetShopsDto extends PaginationArgs {
    @ApiPropertyOptional({ description: 'Order by field', enum: QueryShopsOrderByColumn })
    @IsOptional()
    @IsEnum(QueryShopsOrderByColumn)
    orderBy?: QueryShopsOrderByColumn;

    @ApiPropertyOptional({ description: 'Search term' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Filter by active status' })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    is_active?: boolean;

    @ApiPropertyOptional({ description: 'Advanced search' })
    @IsOptional()
    @IsString()
    text?: string;
}