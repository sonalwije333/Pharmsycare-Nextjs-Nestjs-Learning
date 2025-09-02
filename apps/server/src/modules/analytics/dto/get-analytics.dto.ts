import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalyticsPeriod } from '../../../common/enums/enums';

export class GetAnalyticsDto {
  @ApiPropertyOptional({
    enum: AnalyticsPeriod,
    default: AnalyticsPeriod.MONTH,
  })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  shopId?: number;
}
