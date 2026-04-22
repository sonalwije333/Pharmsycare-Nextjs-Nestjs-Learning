// src/config/database/seeders/faqs-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Faq } from '../../../faqs/entities/faq.entity';

@Injectable()
export class FaqsSeederService {
  private readonly logger = new Logger(FaqsSeederService.name);

  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting FAQs seeder...');

    try {
      await this.clear();
      await this.seedFaqs();
      this.logger.log('✅ FAQs seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed FAQs:', error.message);
      throw error;
    }
  }

  private async seedFaqs() {
    const filePath = await this.findJsonFile('faqs.json');
    if (!filePath) {
      this.logger.warn('⚠️ Could not find faqs.json file, skipping...');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      this.logger.log(`📊 FAQs data loaded: ${data.length} items`);

      for (const faqData of data) {
        const faq = this.faqRepository.create({
          id: faqData.id,
          faq_title: faqData.faq_title,
          slug: faqData.slug,
          faq_description: faqData.faq_description,
          faq_type: faqData.faq_type,
          issued_by: faqData.issued_by,
          language: faqData.language || 'en',
          translated_languages: faqData.translated_languages || ['en'],
          created_at: faqData.created_at
            ? new Date(faqData.created_at)
            : new Date(),
          updated_at: faqData.updated_at
            ? new Date(faqData.updated_at)
            : new Date(),
        });

        await this.faqRepository.save(faq);
        this.logger.debug(`   Saved FAQ: ${faq.faq_title} (ID: ${faq.id})`);
      }

      this.logger.log(`✅ FAQs seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed FAQs:', error.message);
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
    this.logger.log('🧹 Clearing FAQs data...');

    try {
      await this.faqRepository.createQueryBuilder().delete().execute();

      this.logger.log('✅ FAQs data cleared successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clear FAQs data:', error.message);
      throw error;
    }
  }
}
