// users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class UserResponse {
  @ApiProperty({ type: User })
  user: User;
}

export class UserMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: User, required: false })
  user?: User;
}
