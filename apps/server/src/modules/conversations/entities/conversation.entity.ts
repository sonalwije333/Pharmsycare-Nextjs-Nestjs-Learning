// src/modules/conversations/entities/conversation.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';

import { Message } from '../../messages/entities/message.entity';
import { Shop } from 'src/modules/shops/entites/shop.entity';

@Entity()
export class Conversation extends CoreEntity {
  @Column({ type: 'int', nullable: true })
  shop_id: number;

  @Column({ default: false })
  unseen: boolean;

  @Column({ type: 'varchar', nullable: true })
  user_id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Shop, { eager: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToOne(() => Message, { eager: true, nullable: true })
  @JoinColumn({ name: 'latest_message_id' })
  latest_message: Message;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
}