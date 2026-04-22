// reviews/dto/get-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GetReportDto {
  @ApiProperty({
    description: 'Model ID to filter reports',
    required: false
  })
  model_id?: string;
}