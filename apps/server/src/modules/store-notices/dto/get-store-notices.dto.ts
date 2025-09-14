// src/modules/store-notices/dto/get-store-notices.dto.ts
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from "../../common/dto/generic-conditions.dto";
import {QueryStoreNoticesOrderByColumn} from "../../../common/enums/enums";



export class GetStoreNoticesDto extends PaginationArgs {
    @ApiProperty({ enum: QueryStoreNoticesOrderByColumn, required: false })
    @IsEnum(QueryStoreNoticesOrderByColumn)
    @IsOptional()
    orderBy?: QueryStoreNoticesOrderByColumn;

    // @ApiProperty({ enum: SortOrder, required: false })
    // @IsEnum(SortOrder)
    // @IsOptional()
    // sortedBy?: SortOrder;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    language?: string;
}