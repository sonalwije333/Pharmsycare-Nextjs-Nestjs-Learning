// feedbacks/dto/create-feedback.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { Feedback } from '../entities/feedback.entity';

export class CreateFeedBackDto {
  @ApiProperty({
    description: 'Model ID (e.g., product ID, order ID)',
    example: '123',
  })
  @IsString()
  model_id: string;

  @ApiProperty({
    description: 'Model type (e.g., product, order)',
    example: 'product',
  })
  @IsString()
  model_type: string;

  @ApiProperty({
    description: 'Positive feedback',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  positive?: boolean;

  @ApiProperty({
    description: 'Negative feedback',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  negative?: boolean;

  @ApiProperty({ description: 'User ID', required: false })
  @IsString()
  @IsOptional()
  user_id?: string;
}
