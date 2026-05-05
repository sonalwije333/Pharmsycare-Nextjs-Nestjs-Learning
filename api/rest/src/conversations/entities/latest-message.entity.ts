import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';

@Entity('latest_messages')
export class LatestMessage extends CoreEntity {
  @ApiProperty({ description: 'Latest message ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Message body',
    example: 'Hello, I have a question',
    type: String,
  })
  @Column('text')
  body: string;

  @ApiProperty({ 
    description: 'Conversation ID', 
    example: '1',
    type: String,
  })
  @Column()
  conversation_id: string;

  @ApiProperty({ 
    description: 'User ID', 
    example: '1',
    type: String,
  })
  @Column()
  user_id: string;

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