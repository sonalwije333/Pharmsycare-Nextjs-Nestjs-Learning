import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  ManyToOne,
  JoinColumn 
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Entity('messages')
export class Message {
  @ApiProperty({ description: 'Message ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Conversation ID', example: 1, type: Number })
  @Column()
  conversation_id: number;

  @ApiProperty({ description: 'User ID who sent the message', example: 6, type: Number })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Message body content', example: 'Hello, how can I help you?', type: String })
  @Column({ type: 'text' })
  body: string;

  @ApiHideProperty()
  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ApiProperty({ description: 'Soft delete timestamp', required: false, type: Date })
  @DeleteDateColumn()
  deleted_at?: Date;

  @ApiProperty({ description: 'Creation timestamp', type: Date })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp', type: Date })
  @UpdateDateColumn()
  updated_at: Date;
}