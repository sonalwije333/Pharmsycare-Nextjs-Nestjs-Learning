// faqs/dto/faq-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Faq } from '../entities/faq.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class FaqResponse {
  @ApiProperty({ type: Faq })
  faq: Faq;
}

export class FaqMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: Faq, required: false })
  faq?: Faq;
}
