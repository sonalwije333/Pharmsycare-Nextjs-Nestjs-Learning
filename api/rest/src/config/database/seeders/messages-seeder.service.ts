// src/config/database/seeders/messages-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../../messages/entities/message.entity';
import messagesJson from '@db/messages.json';

@Injectable()
export class MessageSeederService {
  private readonly logger = new Logger(MessageSeederService.name);

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async seed() {
    try {
      this.logger.log('💬 Starting message seeding...');

      // Check if messages already exist
      const count = await this.messageRepository.count();
      if (count > 0) {
        this.logger.log(`📊 Found ${count} existing messages, skipping seed`);
        return;
      }

      // Map JSON data to Message entities
      const messages = messagesJson.map((item) => {
        const message = new Message();

        message.id = item.id;
        message.conversation_id = item.conversation_id;
        message.user_id = item.user_id;
        message.body = item.body;
        message.created_at = new Date(item.created_at);
        message.updated_at = new Date(item.updated_at);

        return message;
      });

      // Save messages to database
      const savedMessages = await this.messageRepository.save(messages);

      this.logger.log(`✅ Successfully seeded ${savedMessages.length} messages`);

      // Log message details
      savedMessages.forEach((message) => {
        this.logger.debug(
          `   - ID: ${message.id}, Conversation: ${message.conversation_id}, User: ${message.user_id}, Body: ${message.body.substring(0, 30)}...`,
        );
      });

      return savedMessages;
    } catch (error) {
      this.logger.error(`❌ Failed to seed messages: ${error.message}`);
      throw error;
    }
  }

  async clear() {
    try {
      this.logger.log('🗑️ Clearing messages...');

      const result = await this.messageRepository.delete({});

      this.logger.log(`✅ Cleared ${result.affected || 0} messages`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to clear messages: ${error.message}`);
      throw error;
    }
  }

  async seedSpecific(conversationId: number) {
    const filteredMessages = messagesJson.filter(
      (item) => item.conversation_id === conversationId,
    );

    const messages = filteredMessages.map((item) => {
      const message = new Message();

      message.id = item.id;
      message.conversation_id = item.conversation_id;
      message.user_id = item.user_id;
      message.body = item.body;
      message.created_at = new Date(item.created_at);
      message.updated_at = new Date(item.updated_at);

      return message;
    });

    const saved = await this.messageRepository.save(messages);
    this.logger.log(
      `✅ Seeded ${saved.length} messages for conversation ${conversationId}`,
    );
    return saved;
  }
}
