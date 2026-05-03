import { ApiProperty } from '@nestjs/swagger';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Feedback } from '../entities/feedback.entity';

export class FeedbackResponse {
  @ApiProperty({ type: () => Feedback })
  feedback: Feedback;
}

export class FeedbackMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: () => Feedback, required: false })
  feedback?: Feedback;
}

export class FeedbackPaginator {
  @ApiProperty({ type: () => [Feedback] })
  data: Feedback[];

  @ApiProperty({ example: 1, description: 'Current page number', type: Number })
  current_page: number;

  @ApiProperty({ example: 15, description: 'Items per page', type: Number })
  per_page: number;

  @ApiProperty({ example: 100, description: 'Total items count', type: Number })
  total: number;

  @ApiProperty({ example: 10, description: 'Last page number', type: Number })
  last_page: number;

  @ApiProperty({ example: '/feedbacks?page=1', description: 'First page URL', type: String })
  first_page_url: string;

  @ApiProperty({ example: '/feedbacks?page=10', description: 'Last page URL', type: String })
  last_page_url: string;

  @ApiProperty({ example: '/feedbacks?page=2', nullable: true, description: 'Next page URL', type: String })
  next_page_url: string | null;

  @ApiProperty({ example: '/feedbacks?page=1', nullable: true, description: 'Previous page URL', type: String })
  prev_page_url: string | null;

  @ApiProperty({ example: 1, description: 'Starting item index', type: Number })
  from: number;

  @ApiProperty({ example: 15, description: 'Ending item index', type: Number })
  to: number;
}