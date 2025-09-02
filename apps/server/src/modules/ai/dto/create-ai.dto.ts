import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AiTaskType } from 'src/common/enums/enums';

export class CreateAiDto {
  @ApiProperty({
    description: 'The prompt for AI generation',
    example: 'Generate a product description for a wireless headphones',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    description: 'Type of AI task',
    enum: AiTaskType,
    default: AiTaskType.DESCRIPTION_GENERATION,
    required: false,
  })
  @IsEnum(AiTaskType)
  @IsOptional()
  task_type?: AiTaskType;

  @ApiProperty({
    description: 'Additional context for the AI',
    example: 'Focus on sound quality and battery life',
    required: false,
  })
  @IsString()
  @IsOptional()
  context?: string;

  @ApiProperty({
    description: 'Maximum length of the response',
    example: 500,
    required: false,
  })
  @IsOptional()
  max_length?: number;
}