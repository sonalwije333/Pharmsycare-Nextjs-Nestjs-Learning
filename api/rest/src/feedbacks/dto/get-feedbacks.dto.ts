import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { SortOrder } from 'src/common/enums/enums';
import { FeedbackOrderByColumn, ModelType } from 'src/common/enums/model-type.enum';

export class GetFeedbacksDto extends PaginationArgs {
  @ApiProperty({ 
    description: 'Filter by model type', 
    required: false,
    enum: ModelType,
  })
  @IsOptional()
  @IsEnum(ModelType)
  model_type?: ModelType;

  @ApiProperty({ 
    description: 'Filter by model ID', 
    required: false,
    example: '123',
    type: String,
  })
  @IsOptional()
  @IsString()
  model_id?: string;

  @ApiProperty({ 
    description: 'Filter by user ID', 
    required: false,
    example: '123',
    type: String,
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ 
    description: 'Filter by positive feedback', 
    required: false,
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  positive?: boolean;

  @ApiProperty({ 
    description: 'Filter by negative feedback', 
    required: false,
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  negative?: boolean;

  @ApiProperty({ 
    description: 'Search term', 
    required: false,
    example: 'product',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Column to order by',
    enum: FeedbackOrderByColumn, 
    required: false, 
    default: FeedbackOrderByColumn.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(FeedbackOrderByColumn)
  orderBy?: FeedbackOrderByColumn = FeedbackOrderByColumn.CREATED_AT;

  @ApiProperty({ 
    description: 'Sort direction',
    enum: SortOrder, 
    required: false, 
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortedBy?: SortOrder = SortOrder.DESC;
}