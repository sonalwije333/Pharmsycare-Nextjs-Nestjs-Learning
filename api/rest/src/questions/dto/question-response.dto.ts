// src/questions/dto/question-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Question } from '../entities/question.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class QuestionResponse {
  @ApiProperty({ type: Question })
  question: Question;
}

export class QuestionMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: Question, required: false })
  question?: Question;
}

export class FeedbackResponse extends CoreMutationOutput {
  @ApiProperty({
    description: 'Updated feedback counts',
    example: { positive: 5, negative: 1, total: 6 }
  })
  counts: {
    positive: number;
    negative: number;
    total: number;
  };
}

export { Question };
