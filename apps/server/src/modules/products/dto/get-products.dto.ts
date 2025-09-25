import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { PaginationArgs } from 'src/modules/common/dto/pagination-args.dto';
import { Paginator } from 'src/modules/common/dto/paginator.dto';
import { Product } from '../entities/product.entity';
import {ProductStatus, ProductType, QueryProductsOrderByColumn} from "../../../common/enums/enums";
import {SortOrder} from "../../common/dto/generic-conditions.dto";


export class ProductsPaginator extends Paginator<Product> {}

export class GetProductsDto extends PaginationArgs {
    @ApiPropertyOptional({ enum: QueryProductsOrderByColumn })
    @IsOptional()
    @IsEnum(QueryProductsOrderByColumn)
    orderBy?: QueryProductsOrderByColumn;

    // Fix: Use 'declare' to avoid overwriting base property
    @ApiPropertyOptional({ enum: SortOrder })
    @IsOptional()
    @IsEnum(SortOrder)
    declare sortedBy?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'baby' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Shop ID', example: '1' })
    @IsOptional()
    @IsString()
    shop_id?: string;

    @ApiPropertyOptional({ description: 'Type ID', example: '1' })
    @IsOptional()
    @IsString()
    type_id?: string;

    @ApiPropertyOptional({ enum: ProductStatus })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @ApiPropertyOptional({ enum: ProductType })
    @IsOptional()
    @IsEnum(ProductType)
    product_type?: ProductType;
}

// Add the missing DTO exports
export class GetBestSellingProductsDto {
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