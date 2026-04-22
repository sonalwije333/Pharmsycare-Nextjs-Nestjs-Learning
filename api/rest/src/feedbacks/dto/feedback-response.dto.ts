// feedbacks/dto/feedback-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Feedback } from '../entities/feedback.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class FeedbackResponse {
  @ApiProperty({ type: Feedback })
  feedback: Feedback;
}

export class FeedbackMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: Feedback, required: false })
  feedback?: Feedback;
}

export class FeedbackPaginator {
  @ApiProperty({ type: [Feedback] })
  data: Feedback[];

  @ApiProperty({ example: 1 })
  current_page: number;

  @ApiProperty({ example: 30 })
  per_page: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  last_page: number;

  @ApiProperty({ example: '/feedbacks?page=1' })
  first_page_url: string;

  @ApiProperty({ example: '/feedbacks?page=10' })
  last_page_url: string;

  @ApiProperty({ example: '/feedbacks?page=2', nullable: true })
  next_page_url: string | null;

  @ApiProperty({ example: '/feedbacks?page=1', nullable: true })
  prev_page_url: string | null;

  @ApiProperty({ example: 1 })
  from: number;

  @ApiProperty({ example: 30 })
  to: number;
}
