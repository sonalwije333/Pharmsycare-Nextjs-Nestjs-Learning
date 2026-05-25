// conversations/dto/conversation-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Conversation } from '../entities/conversation.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

export class ConversationResponse {
  @ApiProperty({ type: Conversation })
  conversation: Conversation;
}

export class ConversationMutationResponse extends CoreMutationOutput {
  @ApiProperty({ type: Conversation, required: false })
  conversation?: Conversation;
}
