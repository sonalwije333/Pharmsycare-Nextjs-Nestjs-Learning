// reviews/dto/create-report.dto.ts
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Report } from 'src/reports/entities/report.entity';


export class CreateReportDto extends OmitType(Report, [
  'id',
  'created_at',
  'updated_at',
] as const) {
  @ApiProperty({
    description: 'User ID who is reporting',
    example: 2,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    description: 'Model ID being reported',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  model_id: number;

  @ApiProperty({
    description: 'Model type being reported',
    example: 'Marvel\\Database\\Models\\Review',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  model_type: string;

  @ApiProperty({
    description: 'Report message',
    example: 'This review contains inappropriate content',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}