// conversations/entities/latest-message.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';

@Entity('latest_messages')
export class LatestMessage extends CoreEntity {
  @ApiProperty({ description: 'Latest message ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Message body',
    example: 'Hello, I have a question',
  })
  @Column('text')
  body: string;

  @ApiProperty({ description: 'Conversation ID', example: '1' })
  @Column()
  conversation_id: string;

  @ApiProperty({ description: 'User ID', example: '1' })
  @Column()
  user_id: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
