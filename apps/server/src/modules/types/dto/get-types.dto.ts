import { ApiProperty } from '@nestjs/swagger';
import { SortOrder } from 'src/modules/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/modules/common/dto/pagination-args.dto';
import { Paginator } from 'src/modules/common/dto/paginator.dto';
import { Type } from '../entities/type.entity';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type as TransformType } from 'class-transformer';
import {QueryTypesOrderByOrderByClause} from "../../../common/enums/enums";

// Remove the redundant data property declaration
export class TypesPaginator extends Paginator<Type> {
    // The data property is already inherited from Paginator<Type>
}

export class GetTypesDto extends PaginationArgs {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @TransformType(() => QueryTypesOrderByOrderByClause)
    orderBy?: QueryTypesOrderByOrderByClause[];

    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    search?: string;
}

