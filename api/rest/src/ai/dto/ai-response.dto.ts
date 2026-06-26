// ai/dto/ai-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AiResponseDto {
  @ApiProperty({
    description: 'AI generation status',
    enum: ['success', 'failed'],
    example: 'success',
  })
  status: 'success' | 'failed';

  @ApiProperty({
    description: 'Generated content from AI',
    example: 'This is a dummy response for dummy API.',
    required: false,
  })
  result?: string;

  @ApiProperty({
    description: 'Error message if generation failed',
    example: 'Failed to generate description',
    required: false,
  })
  error?: string;
}
