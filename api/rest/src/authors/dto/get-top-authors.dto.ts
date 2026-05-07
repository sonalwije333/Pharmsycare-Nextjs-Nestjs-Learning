import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTopAuthorsDto {
  @ApiProperty({ 
    required: false, 
    default: 10,
    type: Number,
    description: 'Number of top authors to retrieve',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}