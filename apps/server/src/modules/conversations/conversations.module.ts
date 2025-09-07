// src/modules/conversations/conversations.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from '../messages/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Shop } from '../shops/entites/shop.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, User, Shop])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}