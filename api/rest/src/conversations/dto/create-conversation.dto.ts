// conversations/dto/create-conversation.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Conversation } from '../entities/conversation.entity';

export class CreateConversationDto extends PickType(Conversation, [
  'shop_id',
] as const) {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({
    description: 'Initial message',
    example: 'Hello, I have a question',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}
