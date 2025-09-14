import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { Wishlist } from '../entities/wishlist.entity';
import { Paginator } from '../../common/dto/paginator.dto';

export class WishlistPaginator extends Paginator<Wishlist> {}

export enum QueryWishlistsOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    UPDATED_AT = 'UPDATED_AT',
}

export class GetWishlistDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryWishlistsOrderByColumn,
        example: QueryWishlistsOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryWishlistsOrderByColumn)
    orderBy?: QueryWishlistsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'User ID filter', example: 1 })
    @IsOptional()
    @IsNumber()
    user_id?: number;

    @ApiPropertyOptional({ description: 'Product ID filter', example: 1 })
    @IsOptional()
    @IsNumber()
    product_id?: number;
}