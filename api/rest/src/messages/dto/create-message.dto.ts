// messages/dto/create-message.dto.ts
import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Message } from '../entities/message.entity';

export class CreateMessageDto extends PickType(Message, ['body']) {
  @ApiProperty({
    description: 'Message body content',
    example: 'Hello, how can I help you?',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  body: string;
}