// src/modules/messages/entities/message.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Message extends CoreEntity {
  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'int' })
  conversation_id: number;

  @Column({ type: 'varchar', nullable: true })
  user_id: string;

//  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'json', nullable: true })
  attachments: any[];
}