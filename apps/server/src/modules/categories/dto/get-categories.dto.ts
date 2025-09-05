// src/modules/categories/dto/get-category.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsArray } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { Paginator } from '../../common/dto/paginator.dto';
import { Category } from '../entities/category.entity';
import { SortOrder } from '../../common/dto/generic-conditions.dto';

export class CategoriesPaginator extends Paginator<Category> {}

export class GetCategoriesDto extends PaginationArgs {
    @ApiPropertyOptional({ description: 'Search query', example: 'baby' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiPropertyOptional({ description: 'Parent category ID', example: 'parent-id' })
    @IsOptional()
    @IsString()
    parent?: string;

    @ApiPropertyOptional({ description: 'Type ID filter', example: 'type-id' })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiPropertyOptional({ description: 'Is approved filter', example: true })
    @IsOptional()
    @IsBoolean()
    is_approved?: boolean;

    @ApiPropertyOptional({ description: 'Order by column', enum: ['CREATED_AT', 'NAME', 'UPDATED_AT'] })
    @IsOptional()
    @IsString()
    orderBy?: string;

    @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder })
    @IsOptional()
    @IsString()
    sortOrder?: SortOrder;
}

export enum QueryCategoriesOrderByColumn {
    CREATED_AT = 'CREATED_AT',
    NAME = 'NAME',
    UPDATED_AT = 'UPDATED_AT',
}