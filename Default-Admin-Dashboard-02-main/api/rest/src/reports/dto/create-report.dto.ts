// reports/dto/create-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'User ID who is reporting',
    example: 2,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    description: 'Model type (e.g., Review, Product, etc.)',
    example: 'Marvel\\Database\\Models\\Review',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  model_type: string;

  @ApiProperty({
    description: 'ID of the model being reported',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  model_id: number;

  @ApiProperty({
    description: 'Report message',
    example: 'This is an abusive report',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}