// src/config/database/seeders/refund-reason-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundReason } from '../../../refund-reasons/entities/refund-reasons.entity';

@Injectable()
export class RefundReasonSeederService {
  private readonly logger = new Logger(RefundReasonSeederService.name);

  constructor(
    @InjectRepository(RefundReason)
    private refundReasonRepository: Repository<RefundReason>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getRefundReasonsData(): Partial<RefundReason>[] {
    return [
      {
        name: 'Product Not as Described',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Wrong Item Shipped',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Damaged Item',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Cancelled Order',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Late Delivery',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Item Not Needed',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Changed Mind',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Others',
        language: 'en',
        translated_languages: ['en'],
      },
      // Additional reasons for other languages
      {
        name: 'Produit non conforme',
        language: 'fr',
        translated_languages: ['fr'],
      },
      {
        name: 'Article endommagé',
        language: 'fr',
        translated_languages: ['fr'],
      },
      {
        name: 'Producto no es como se describe',
        language: 'es',
        translated_languages: ['es'],
      },
      {
        name: 'Artículo dañado',
        language: 'es',
        translated_languages: ['es'],
      },
      {
        name: 'Falsch gelieferter Artikel',
        language: 'de',
        translated_languages: ['de'],
      },
      {
        name: 'Beschädigter Artikel',
        language: 'de',
        translated_languages: ['de'],
      },
    ];
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting refund reasons seeding...');
      
      const reasons = this.getRefundReasonsData();
      
      for (const reasonData of reasons) {
        const reasonName = reasonData.name;
        if (!reasonName) {
          this.logger.warn('Skipping refund reason with missing name');
          continue;
        }

        const existingReason = await this.refundReasonRepository.findOne({
          where: { name: reasonName, language: reasonData.language },
        });

        if (!existingReason) {
          const newReason = this.refundReasonRepository.create({
            ...reasonData,
            slug: this.generateSlug(reasonName),
          });
          await this.refundReasonRepository.save(newReason);
          this.logger.log(`Created refund reason: ${reasonName} (${reasonData.language})`);
        } else {
          this.logger.log(`Refund reason already exists: ${reasonName} (${reasonData.language})`);
        }
      }
      
      this.logger.log('Refund reasons seeding completed');
    } catch (error) {
      this.logger.error('Error seeding refund reasons:', error);
      throw error;
    }
  }

  async seedByLanguage(language: string): Promise<void> {
    try {
      this.logger.log(`Seeding refund reasons for language: ${language}`);
      
      const reasons = this.getRefundReasonsData().filter(r => r.language === language);
      
      for (const reasonData of reasons) {
        const reasonName = reasonData.name;
        if (!reasonName) {
          this.logger.warn('Skipping refund reason with missing name');
          continue;
        }

        const existingReason = await this.refundReasonRepository.findOne({
          where: { name: reasonName, language: reasonData.language },
        });

        if (!existingReason) {
          const newReason = this.refundReasonRepository.create({
            ...reasonData,
            slug: this.generateSlug(reasonName),
          });
          await this.refundReasonRepository.save(newReason);
          this.logger.log(`Created refund reason: ${reasonName} (${reasonData.language})`);
        }
      }
      
      this.logger.log(`Refund reasons for language ${language} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding refund reasons for language ${language}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing refund reasons...');
      await this.refundReasonRepository.clear();
      this.logger.log('Refund reasons cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing refund reasons:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    languages: string[];
    reasons: Array<{ id: number; name: string; slug: string; language: string }>;
  }> {
    const reasons = await this.refundReasonRepository.find();
    
    const languages = [...new Set(reasons.map(r => r.language))];
    
    const reasonsList = reasons.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      language: r.language,
    }));
    
    return {
      total: reasons.length,
      languages,
      reasons: reasonsList,
    };
  }
}