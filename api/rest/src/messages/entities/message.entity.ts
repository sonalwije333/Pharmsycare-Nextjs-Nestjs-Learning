// messages/entities/message.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Conversation } from 'src/conversations/entities/conversation.entity';


@Entity('messages')
export class Message {
  @ApiProperty({ description: 'Message ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Conversation ID', example: 1 })
  @Column()
  conversation_id: number;

  @ApiProperty({ description: 'User ID who sent the message', example: 6 })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Message body content', example: 'Hello, how can I help you?' })
  @Column({ type: 'text' })
  body: string;

  @ApiProperty({ description: 'Conversation', type: () => Conversation }) // Commented for future use
  conversation: Conversation;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}