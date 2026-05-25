// feedbacks/dto/get-feedbacks.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';

export class GetFeedbacksDto extends PaginationArgs {
  @ApiProperty({ required: false })
  model_type?: string;

  @ApiProperty({ required: false })
  model_id?: string;

  @ApiProperty({ required: false })
  user_id?: string;

  @ApiProperty({ required: false })
  positive?: boolean;

  @ApiProperty({ required: false })
  negative?: boolean;

  @ApiProperty({ required: false })
  search?: string;
}
