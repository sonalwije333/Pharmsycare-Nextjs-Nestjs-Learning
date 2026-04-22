// authors/dto/author-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Author } from '../entities/author.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class AuthorResponse {
  @ApiProperty({ type: Author })
  author: Author;
}

export class AuthorMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: Author, required: false })
  author?: Author;
}
