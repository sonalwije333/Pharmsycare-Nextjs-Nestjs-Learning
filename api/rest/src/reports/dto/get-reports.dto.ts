// reports/dto/get-reports.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Report } from '../entities/report.entity';

export class ReportPaginator extends Paginator<Report> {
  @ApiProperty({ type: [Report] })
  data: Report[];
}

export class GetReportDto extends PaginationArgs {
  @ApiProperty({
    description: 'Order by field',
    enum: ['CREATED_AT', 'UPDATED_AT', 'MODEL_TYPE'],
    required: false
  })
  orderBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC'
  })
  sortedBy?: string;

  @ApiProperty({
    description: 'Search text in message',
    required: false
  })
  search?: string;

  @ApiProperty({
    description: 'Filter by model type',
    example: 'Marvel\\Database\\Models\\Review',
    required: false
  })
  model_type?: string;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false
  })
  user_id?: number;

  @ApiProperty({
    description: 'Filter by model ID',
    required: false
  })
  model_id?: number;
}

export enum QueryReviewsOrderByColumn {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}