// src/config/database/seeders/conversations-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Conversation } from '../../../conversations/entities/conversation.entity';
import { LatestMessage } from '../../../conversations/entities/latest-message.entity';
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class ConversationsSeederService {
  private readonly logger = new Logger(ConversationsSeederService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(LatestMessage)
    private readonly latestMessageRepository: Repository<LatestMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting conversations seeder...');

    try {
      await this.clear();
      await this.seedConversations();
      this.logger.log('✅ Conversations seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed conversations:', error.message);
      throw error;
    }
  }

  private async seedConversations() {
    const filePath = await this.findJsonFile('conversations.json');
    if (!filePath) {
      this.logger.warn(
        '⚠️ Could not find conversations.json file, skipping...',
      );
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      this.logger.log(`📊 Conversations data loaded: ${data.length} items`);

      const users = await this.userRepository.find({
        select: ['id', 'email'],
      });
      const userIds = new Set(users.map((user) => user.id.toString()));
      const usersByEmail = new Map(
        users
          .filter((user) => !!user.email)
          .map((user) => [user.email.toLowerCase(), user.id.toString()]),
      );

      let seededCount = 0;
      let remappedCount = 0;
      let skippedCount = 0;

      for (const item of data) {
        const sourceUserId = String(item.user_id);
        let conversationUserId = sourceUserId;

        if (!userIds.has(sourceUserId)) {
          const fallbackEmail = item?.user?.email?.toLowerCase?.();
          const mappedUserId = fallbackEmail
            ? usersByEmail.get(fallbackEmail)
            : undefined;

          if (!mappedUserId) {
            skippedCount++;
            this.logger.warn(
              `⚠️ Skipping conversation ${item.id}: user_id ${sourceUserId} not found and no matching user email in DB`,
            );
            continue;
          }

          remappedCount++;
          conversationUserId = mappedUserId;
          this.logger.debug(
            `   Remapped conversation ${item.id} user_id ${sourceUserId} -> ${conversationUserId} via email ${fallbackEmail}`,
          );
        }

        // First, create and save latest message if exists
        let latestMessage = null;
        if (item.latest_message) {
          latestMessage = this.latestMessageRepository.create({
            body: item.latest_message.body,
            conversation_id: item.latest_message.conversation_id || item.id,
            user_id: item.latest_message.user_id || conversationUserId,
            created_at: item.latest_message.created_at
              ? new Date(item.latest_message.created_at)
              : new Date(),
            updated_at: item.latest_message.updated_at
              ? new Date(item.latest_message.updated_at)
              : new Date(),
          });

          latestMessage = await this.latestMessageRepository.save(
            latestMessage,
          );
          this.logger.debug(
            `   Saved latest message for conversation ${item.id}`,
          );
        }

        // Create conversation
        const conversation = this.conversationRepository.create({
          id: parseInt(item.id),
          user_id: conversationUserId,
          shop_id: parseInt(item.shop_id),
          unseen: item.unseen === 1 || item.unseen === true,
          latest_message: latestMessage,
          latest_message_id: latestMessage?.id,
          created_at: item.created_at ? new Date(item.created_at) : new Date(),
          updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
        });

        await this.conversationRepository.save(conversation);
        seededCount++;
        this.logger.debug(
          `   Saved conversation: ID ${conversation.id} (User: ${conversation.user_id}, Shop: ${conversation.shop_id})`,
        );
      }

      this.logger.log(
        `✅ Conversations seeded successfully (seeded: ${seededCount}, remapped: ${remappedCount}, skipped: ${skippedCount})`,
      );
    } catch (error) {
      this.logger.error('❌ Failed to seed conversations:', error.message);
      throw error;
    }
  }

  private async findJsonFile(filename: string): Promise<string | null> {
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'db', 'pickbazar', filename),
      path.join(
        process.cwd(),
        'src',
        'config',
        'database',
        'pickbazar',
        filename,
      ),
      path.join(process.cwd(), 'api-src-db-pickbazar', filename),
      path.join(process.cwd(), 'database', 'pickbazar', filename),
      path.join(process.cwd(), 'db', 'pickbazar', filename),
      path.join(process.cwd(), 'pickbazar', filename),
      path.join(__dirname, '..', '..', '..', '..', 'db', 'pickbazar', filename),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        this.logger.debug(`📁 Found ${filename} at: ${p}`);
        return p;
      }
    }

    return null;
  }

  async clear() {
    this.logger.log('🧹 Clearing conversations data...');

    try {
      // Delete in correct order due to foreign key constraints
      await this.conversationRepository.createQueryBuilder().delete().execute();

      await this.latestMessageRepository
        .createQueryBuilder()
        .delete()
        .execute();

      this.logger.log('✅ Conversations data cleared successfully');
    } catch (error) {
      this.logger.error(
        '❌ Failed to clear conversations data:',
        error.message,
      );
      throw error;
    }
  }
}
