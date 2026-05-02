// authors/dto/get-top-authors.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GetTopAuthorsDto {
  @ApiProperty({ required: false, default: 10 })
  limit?: number;
}
