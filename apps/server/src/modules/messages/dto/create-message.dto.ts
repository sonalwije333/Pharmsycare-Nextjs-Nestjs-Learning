// src/modules/messages/dto/create-message.dto.ts
import { PickType } from '@nestjs/swagger';
import { Message } from '../entities/message.entity';

export class CreateMessageDto extends PickType(Message, [
  'body',
  'conversation_id',
  'user_id',
  'attachments'
]) {}