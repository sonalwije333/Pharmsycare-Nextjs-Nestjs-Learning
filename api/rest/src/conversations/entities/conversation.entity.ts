// conversations/entities/conversation.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
// Comment out Shop import temporarily
// import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';
import { LatestMessage } from './latest-message.entity';

@Entity('conversations')
export class Conversation extends CoreEntity {
  @ApiProperty({ description: 'Conversation ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Shop ID', example: 7 })
  @Column()
  shop_id: number;

  @ApiProperty({ description: 'User ID', example: '6' })
  @Column()
  user_id: string;

  @ApiProperty({ description: 'Unseen status', example: false })
  @Column({ default: false })
  unseen: boolean;

  @ApiProperty({ type: () => User, description: 'User details' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Comment out Shop relation temporarily
  // @ApiProperty({ type: () => Shop, description: 'Shop details' })
  // @ManyToOne(() => Shop)
  // @JoinColumn({ name: 'shop_id' })
  // shop: Shop;

  @ApiProperty({ type: () => LatestMessage, description: 'Latest message' })
  @OneToOne(() => LatestMessage)
  @JoinColumn({ name: 'latest_message_id' })
  latest_message: LatestMessage;

  @ApiProperty({ description: 'Latest message ID', required: false })
  @Column({ nullable: true })
  latest_message_id?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}

export { LatestMessage } from './latest-message.entity';
