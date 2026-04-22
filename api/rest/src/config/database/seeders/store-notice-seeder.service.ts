// src/config/database/seeders/store-notice-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreNotice, StoreNoticePriorityType } from '../../../store-notices/entities/store-notices.entity';
import storeNoticesJson from '@db/store-notices.json';
import { plainToClass } from 'class-transformer';

@Injectable()
export class StoreNoticeSeederService {
  private readonly logger = new Logger(StoreNoticeSeederService.name);

  constructor(
    @InjectRepository(StoreNotice)
    private storeNoticeRepository: Repository<StoreNotice>,
  ) {}

  private getStoreNoticesData(): Partial<StoreNotice>[] {
    const notices = plainToClass(StoreNotice, storeNoticesJson);
    return notices.map((notice: any) => ({
      id: notice.id,
      priority: notice.priority,
      notice: notice.notice,
      description: notice.description,
      effective_from: notice.effective_from,
      expired_at: notice.expired_at,
      type: notice.type,
      created_by: notice.created_by,
      updated_by: notice.updated_by,
      is_read: notice.is_read || false,
      created_at: notice.created_at ? new Date(notice.created_at) : new Date(),
      updated_at: notice.updated_at ? new Date(notice.updated_at) : new Date(),
    }));
  }

  private getAdditionalStoreNoticesData(): Partial<StoreNotice>[] {
    return [
      {
        priority: StoreNoticePriorityType.HIGH,
        notice: 'System Upgrade Notice',
        description: 'The system will be upgraded on Sunday from 2 AM to 6 AM EST. Please plan your activities accordingly.',
        effective_from: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expired_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        type: 'all_vendor',
        created_by: '1',
        is_read: false,
      },
      {
        priority: StoreNoticePriorityType.MEDIUM,
        notice: 'New Feature Announcement',
        description: 'We are excited to announce new features for inventory management. Check out the documentation for details.',
        effective_from: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        type: 'all_vendor',
        created_by: '1',
        is_read: false,
      },
      {
        priority: StoreNoticePriorityType.LOW,
        notice: 'Holiday Schedule',
        description: 'Our support team will be available with reduced hours during the upcoming holidays.',
        effective_from: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        expired_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        type: 'all_vendor',
        created_by: '1',
        is_read: false,
      },
    ];
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting store notices seeding...');
      
      // Seed existing data from JSON
      const notices = this.getStoreNoticesData();
      
      for (const noticeData of notices) {
        const existingNotice = await this.storeNoticeRepository.findOne({
          where: { id: noticeData.id },
        });

        if (!existingNotice) {
          const newNotice = this.storeNoticeRepository.create(noticeData);
          await this.storeNoticeRepository.save(newNotice);
          this.logger.log(`Created store notice: ${noticeData.notice}`);
        } else {
          this.logger.log(`Store notice ${noticeData.notice} already exists`);
        }
      }

      // Seed additional store notices
      const additionalNotices = this.getAdditionalStoreNoticesData();
      
      for (const noticeData of additionalNotices) {
        const existingNotice = await this.storeNoticeRepository.findOne({
          where: { notice: noticeData.notice },
        });

        if (!existingNotice) {
          const newNotice = this.storeNoticeRepository.create(noticeData);
          await this.storeNoticeRepository.save(newNotice);
          this.logger.log(`Created store notice: ${noticeData.notice}`);
        } else {
          this.logger.log(`Store notice ${noticeData.notice} already exists`);
        }
      }
      
      this.logger.log('Store notices seeding completed');
    } catch (error) {
      this.logger.error('Error seeding store notices:', error);
      throw error;
    }
  }

  async seedByPriority(priority: string): Promise<void> {
    try {
      this.logger.log(`Seeding store notices with priority: ${priority}`);
      
      const additionalNotices = this.getAdditionalStoreNoticesData()
        .filter(n => n.priority === priority);
      
      for (const noticeData of additionalNotices) {
        const existingNotice = await this.storeNoticeRepository.findOne({
          where: { notice: noticeData.notice },
        });

        if (!existingNotice) {
          const newNotice = this.storeNoticeRepository.create(noticeData);
          await this.storeNoticeRepository.save(newNotice);
          this.logger.log(`Created store notice: ${noticeData.notice}`);
        }
      }
      
      this.logger.log(`Store notices with priority ${priority} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding store notices with priority ${priority}:`, error);
      throw error;
    }
  }

  async seedByType(type: string): Promise<void> {
    try {
      this.logger.log(`Seeding store notices with type: ${type}`);
      
      const additionalNotices = this.getAdditionalStoreNoticesData()
        .filter(n => n.type === type);
      
      for (const noticeData of additionalNotices) {
        const existingNotice = await this.storeNoticeRepository.findOne({
          where: { notice: noticeData.notice },
        });

        if (!existingNotice) {
          const newNotice = this.storeNoticeRepository.create(noticeData);
          await this.storeNoticeRepository.save(newNotice);
          this.logger.log(`Created store notice: ${noticeData.notice}`);
        }
      }
      
      this.logger.log(`Store notices with type ${type} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding store notices with type ${type}:`, error);
      throw error;
    }
  }

  async seedByCreator(createdBy: number): Promise<void> {
    try {
      this.logger.log(`Seeding store notices created by user: ${createdBy}`);
      
      const notices = this.getStoreNoticesData()
        .filter(n => parseInt(n.created_by as string) === createdBy);
      
      for (const noticeData of notices) {
        const existingNotice = await this.storeNoticeRepository.findOne({
          where: { id: noticeData.id },
        });

        if (!existingNotice) {
          const newNotice = this.storeNoticeRepository.create(noticeData);
          await this.storeNoticeRepository.save(newNotice);
          this.logger.log(`Created store notice: ${noticeData.notice}`);
        }
      }
      
      this.logger.log(`Store notices created by user ${createdBy} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding store notices created by user ${createdBy}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing store notices...');
      await this.storeNoticeRepository.clear();
      this.logger.log('Store notices cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing store notices:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    uniqueUsers: number;
  }> {
    const notices = await this.storeNoticeRepository.find();
    
    const byPriority: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const uniqueUsersSet = new Set<string>();
    
    for (const notice of notices) {
      byPriority[notice.priority] = (byPriority[notice.priority] || 0) + 1;
      byType[notice.type || 'all_vendor'] = (byType[notice.type || 'all_vendor'] || 0) + 1;
      uniqueUsersSet.add(notice.created_by);
    }
    
    return {
      total: notices.length,
      byPriority,
      byType,
      uniqueUsers: uniqueUsersSet.size,
    };
  }
}