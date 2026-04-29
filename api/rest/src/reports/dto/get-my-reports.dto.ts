// reports/dto/get-my-reports.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Report } from '../entities/report.entity';

export class ReportPaginator extends Paginator<Report> {
  @ApiProperty({ type: [Report] })
  data: Report[];
}

export class GetMyReportsDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['created_at', 'updated_at', 'model_type'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'model_type', 'CREATED_AT', 'UPDATED_AT', 'MODEL_TYPE'])
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC', 'asc', 'desc'],
    required: false,
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text in message',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by model type',
    example: 'Marvel\\Database\\Models\\Review',
    required: false
  })
  @IsOptional()
  @IsString()
  model_type?: string;

  @ApiProperty({
    description: 'Filter by model ID',
    required: false
  })
  @IsOptional()
  model_id?: number;

  @ApiProperty({
    description: 'Language filter',
    example: 'en',
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Related resources to include',
    example: 'user',
    required: false
  })
  @IsOptional()
  @IsString()
  with?: string;
}
