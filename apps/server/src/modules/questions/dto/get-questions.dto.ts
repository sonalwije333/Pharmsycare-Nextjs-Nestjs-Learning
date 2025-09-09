import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination-args.dto';
import { SortOrder } from '../../common/dto/generic-conditions.dto';
import { Question } from '../entities/question.entity';
import { Paginator } from '../../common/dto/paginator.dto';
import {QueryQuestionsOrderByColumn} from "../../../common/enums/enums";

export class QuestionPaginator extends Paginator<Question> {}


export class GetQuestionsDto extends PaginationArgs {
    @ApiPropertyOptional({
        description: 'Order by column',
        enum: QueryQuestionsOrderByColumn,
        example: QueryQuestionsOrderByColumn.CREATED_AT
    })
    @IsOptional()
    @IsEnum(QueryQuestionsOrderByColumn)
    orderBy?: QueryQuestionsOrderByColumn;

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: SortOrder,
        example: SortOrder.DESC
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({ description: 'Search query', example: 'baby' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Answer filter', example: 'yes' })
    @IsOptional()
    @IsString()
    answer?: string;

    @ApiPropertyOptional({ description: 'Product ID filter', example: 1 })
    @IsOptional()
    @IsNumber()
    product_id?: number;

    @ApiPropertyOptional({ description: 'User ID filter', example: 1 })
    @IsOptional()
    @IsNumber()
    user_id?: number;

    @ApiPropertyOptional({ description: 'Shop ID filter', example: 1 })
    @IsOptional()
    @IsNumber()
    shop_id?: number;
}