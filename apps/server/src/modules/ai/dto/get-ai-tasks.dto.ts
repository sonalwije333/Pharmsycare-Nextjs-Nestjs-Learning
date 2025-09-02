import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AiStatus, AiTaskType } from 'src/common/enums/enums';
import { SortOrder } from 'src/modules/common/dto/generic-conditions.dto';

export class GetAiTasksDto {
  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsEnum(SortOrder)
  @IsOptional()
  sortedBy?: SortOrder;

  @ApiPropertyOptional({ enum: AiStatus })
  @IsEnum(AiStatus)
  @IsOptional()
  status?: AiStatus;

  @ApiPropertyOptional({ enum: AiTaskType })
  @IsEnum(AiTaskType)
  @IsOptional()
  task_type?: AiTaskType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}