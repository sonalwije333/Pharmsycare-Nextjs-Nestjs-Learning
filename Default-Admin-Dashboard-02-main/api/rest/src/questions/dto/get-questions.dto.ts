// src/questions/dto/get-questions.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Question } from '../entities/question.entity';

export class QuestionPaginator extends Paginator<Question> {
  @ApiProperty({ type: [Question] })
  data: Question[];
}

export enum QueryQuestionsOrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  QUESTION = 'question',
}

export class GetQuestionsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: QueryQuestionsOrderByColumn,
    required: false,
    default: QueryQuestionsOrderByColumn.CREATED_AT
  })
  @IsOptional()
  @IsEnum(QueryQuestionsOrderByColumn)
  orderBy?: QueryQuestionsOrderByColumn = QueryQuestionsOrderByColumn.CREATED_AT;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  sortedBy?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Search text in questions and answers',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by product ID',
    required: false,
    example: 470
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  product_id?: number;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
    example: 2
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  user_id?: number;

  @ApiProperty({
    description: 'Filter by shop ID',
    required: false,
    example: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  shop_id?: number;

  @ApiProperty({
    description: 'Filter answered/unanswered questions',
    enum: ['answered', 'unanswered', 'all'],
    required: false,
    default: 'all'
  })
  @IsOptional()
  @IsString()
  answer_status?: 'answered' | 'unanswered' | 'all' = 'all';

  @ApiProperty({
    description: 'Legacy answer filter accepted by admin UI',
    required: false,
    example: 'null'
  })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiProperty({
    description: 'Relation include list (e.g. product;user)',
    required: false
  })
  @IsOptional()
  @IsString()
  with?: string;

  @ApiProperty({
    description: 'Search join operator',
    enum: ['and', 'or'],
    required: false
  })
  @IsOptional()
  @IsString()
  searchJoin?: string;
}

export class GetMyQuestionsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by column',
    enum: QueryQuestionsOrderByColumn,
    required: false
  })
  @IsOptional()
  @IsEnum(QueryQuestionsOrderByColumn)
  orderBy?: QueryQuestionsOrderByColumn;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false
  })
  @IsOptional()
  @IsString()
  sortedBy?: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'Search text',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;
}