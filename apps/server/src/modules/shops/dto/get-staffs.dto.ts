// src/modules/shops/dto/get-staffs.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';

export class GetStaffsDto extends PaginationArgs {
    @ApiPropertyOptional({ description: 'Shop ID' })
    @IsOptional()
    @IsString()
    shop_id?: string;
}