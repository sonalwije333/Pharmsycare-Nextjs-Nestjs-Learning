import { Withdraw } from '../entities/withdraw.entity';
import { Paginator } from "../../common/dto/paginator.dto";
import { PaginationArgs } from "../../common/dto/pagination-args.dto";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { WithdrawStatus } from "../../../common/enums/enums";

export class WithdrawPaginator extends Paginator<Withdraw> {
    @ApiProperty({ type: [Withdraw] })
    declare data: Withdraw[]; // Added 'declare' modifier
}

export class GetWithdrawsDto extends PaginationArgs {
    @ApiPropertyOptional({ enum: WithdrawStatus, description: 'Filter by withdraw status' })
    @IsOptional()
    @IsEnum(WithdrawStatus)
    status?: WithdrawStatus;

    @ApiPropertyOptional({ description: 'Filter by shop ID' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    shop_id?: number;

    @ApiPropertyOptional({ description: 'Sort by field name' })
    @IsOptional()
    @IsString()
    orderBy?: string;

    @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Sort order' })
    @IsOptional()
    @IsString()
    declare sortedBy?: string; // Added 'declare' modifier

    @ApiPropertyOptional({ description: 'Search text' })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiPropertyOptional({ description: 'Advanced search query (format: field:value;field2:value2)' })
    @IsOptional()
    @IsString()
    search?: string;
}