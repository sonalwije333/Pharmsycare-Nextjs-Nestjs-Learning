import { ApiProperty } from '@nestjs/swagger';
import { AiStatus } from 'src/common/enums/ai-status.enum';

export class Ai {
  @ApiProperty({
    description: 'AI generation status',
    enum: AiStatus,
    example: AiStatus.SUCCESS,
    type: String,
  })
  status: AiStatus;

  @ApiProperty({
    description: 'Generated content from AI',
    example: 'This is a dummy response for dummy API.',
    required: false,
    type: String,
  })
  result?: string;

  @ApiProperty({
    description: 'Error message if generation failed',
    example: 'Failed to generate description',
    required: false,
    type: String,
  })
  error?: string;
}