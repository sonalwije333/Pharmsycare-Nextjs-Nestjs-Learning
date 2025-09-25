import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsNumber, IsOptional, IsString} from "class-validator";

export class GetPopularProductsDto {
    @ApiPropertyOptional({ description: 'Type slug', example: 'electronics' })
    @IsOptional()
    @IsString()
    type_slug?: string;

    @ApiPropertyOptional({ description: 'Limit', example: 10, default: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number;

    @ApiPropertyOptional({ description: 'Shop ID', example: 1 })
    @IsOptional()
    @IsNumber()
    shop_id?: number;
}