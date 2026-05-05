import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { CoreEntity } from '../../common/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import { LatestMessage } from './latest-message.entity';

@Entity('conversations')
export class Conversation extends CoreEntity {
  @ApiProperty({ description: 'Conversation ID', example: 1, type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Shop ID', example: 7, type: Number })
  @Column()
  shop_id: number;

  @ApiProperty({ description: 'User ID', example: '6', type: String })
  @Column()
  user_id: string;

  @ApiProperty({ description: 'Unseen status', example: false, type: Boolean })
  @Column({ default: false })
  unseen: boolean;

  @ApiProperty({ description: 'Latest message ID', required: false, type: Number })
  @Column({ nullable: true })
  latest_message_id?: number;

  @ApiProperty({ type: () => User, description: 'User details' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ type: () => LatestMessage, description: 'Latest message' })
  @OneToOne(() => LatestMessage)
  @JoinColumn({ name: 'latest_message_id' })
  latest_message: LatestMessage;

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

export { LatestMessage } from './latest-message.entity';