import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 1,
    required: true,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  conversation_id: number;

  @ApiProperty({
    description: 'Message body content',
    example: 'Hello, how can I help you?',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'User ID sending the message',
    example: 6,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  user_id?: number;
}