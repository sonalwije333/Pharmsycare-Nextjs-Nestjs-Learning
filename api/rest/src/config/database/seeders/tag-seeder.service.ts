// src/config/database/seeders/tag-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../../tags/entities/tag.entity';
import tagsJson from '@db/tags.json';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TagSeederService {
  private readonly logger = new Logger(TagSeederService.name);

  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getTagsData(): Partial<Tag>[] {
    const tags = plainToClass(Tag, tagsJson);
    return tags.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      details: tag.details,
      image: tag.image,
      icon: tag.icon,
      type: tag.type,
      language: tag.language || 'en',
      translated_languages: tag.translated_languages || ['en'],
      created_at: tag.created_at ? new Date(tag.created_at) : new Date(),
      updated_at: tag.updated_at ? new Date(tag.updated_at) : new Date(),
    }));
  }

  private getAdditionalTagsData(): Partial<Tag>[] {
    // PharmSy-Care is a pharmacy: only medicine / healthcare related tags.
    return [
      {
        name: 'Pain Relief',
        details: 'Analgesics and pain management medicines',
        icon: 'fa-pills',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Vitamins & Supplements',
        details: 'Vitamins, minerals and dietary supplements',
        icon: 'fa-capsules',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Cold & Flu',
        details: 'Cough, cold and flu relief products',
        icon: 'fa-head-side-cough',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'First Aid',
        details: 'First aid and wound care essentials',
        icon: 'fa-kit-medical',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Skincare',
        details: 'Dermatological and skincare products',
        icon: 'fa-hand-sparkles',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Personal Care',
        details: 'Personal hygiene and wellness products',
        icon: 'fa-soap',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Health & Beauty',
        details: 'Health and beauty products',
        icon: 'fa-heartbeat',
        language: 'en',
        translated_languages: ['en'],
      },
    ];
  }

  // Legacy generic e-commerce tags that are not relevant to a pharmacy.
  // Removed from the database so the Tags module only shows medicine / pharmacy tags.
  private static readonly NON_PHARMACY_TAGS = [
    'Electronics',
    'Fashion',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Automotive',
  ];

  private async removeNonPharmacyTags(): Promise<void> {
    for (const name of TagSeederService.NON_PHARMACY_TAGS) {
      const existing = await this.tagRepository.findOne({ where: { name } });
      if (existing) {
        try {
          await this.tagRepository.delete({ id: existing.id });
          this.logger.log(`Removed non-pharmacy tag: ${name}`);
        } catch (error) {
          this.logger.warn(
            `Could not remove tag "${name}" (it may be linked to products): ${error.message}`,
          );
        }
      }
    }
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting tags seeding...');
      
      // Seed existing data from JSON
      const tags = this.getTagsData();
      
      for (const tagData of tags) {
        const existingTag = await this.tagRepository.findOne({
          where: { id: tagData.id },
        });

        if (!existingTag) {
          const newTag = this.tagRepository.create(tagData);
          await this.tagRepository.save(newTag);
          this.logger.log(`Created tag: ${tagData.name}`);
        } else {
          this.logger.log(`Tag ${tagData.name} already exists`);
        }
      }

      // Seed additional tags
      const additionalTags = this.getAdditionalTagsData();
      
      for (const tagData of additionalTags) {
        if (!tagData.name) {
          continue;
        }

        const existingTag = await this.tagRepository.findOne({
          where: { name: tagData.name },
        });

        if (!existingTag) {
          const newTag = this.tagRepository.create({
            ...tagData,
            slug: this.generateSlug(tagData.name),
          });
          await this.tagRepository.save(newTag);
          this.logger.log(`Created tag: ${tagData.name}`);
        } else {
          this.logger.log(`Tag ${tagData.name} already exists`);
        }
      }
      
      // Remove any previously seeded non-pharmacy tags.
      await this.removeNonPharmacyTags();

      this.logger.log('Tags seeding completed');
    } catch (error) {
      this.logger.error('Error seeding tags:', error);
      throw error;
    }
  }

  async seedByLanguage(language: string): Promise<void> {
    try {
      this.logger.log(`Seeding tags for language: ${language}`);
      
      const tags = this.getTagsData().filter(t => t.language === language);
      
      for (const tagData of tags) {
        const existingTag = await this.tagRepository.findOne({
          where: { id: tagData.id },
        });

        if (!existingTag) {
          const newTag = this.tagRepository.create(tagData);
          await this.tagRepository.save(newTag);
          this.logger.log(`Created tag: ${tagData.name}`);
        }
      }
      
      this.logger.log(`Tags for language ${language} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding tags for language ${language}:`, error);
      throw error;
    }
  }

  async seedByType(typeId: number): Promise<void> {
    try {
      this.logger.log(`Seeding tags for type ID: ${typeId}`);
      
      const tags = this.getTagsData().filter(t => t.type && t.type.id === typeId);
      
      for (const tagData of tags) {
        const existingTag = await this.tagRepository.findOne({
          where: { id: tagData.id },
        });

        if (!existingTag) {
          const newTag = this.tagRepository.create(tagData);
          await this.tagRepository.save(newTag);
          this.logger.log(`Created tag: ${tagData.name}`);
        }
      }
      
      this.logger.log(`Tags for type ${typeId} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding tags for type ${typeId}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing tags...');
      await this.tagRepository.clear();
      this.logger.log('Tags cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing tags:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    languages: string[];
    byType: Record<number, number>;
    tags: Array<{ id: number; name: string; slug: string; language: string }>;
  }> {
    const tags = await this.tagRepository.find();
    
    const languages = [...new Set(tags.map(t => t.language))];
    const byType: Record<number, number> = {};
    const tagsList = tags.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      language: t.language,
    }));
    
    for (const tag of tags) {
      if (tag.type && tag.type.id) {
        byType[tag.type.id] = (byType[tag.type.id] || 0) + 1;
      }
    }
    
    return {
      total: tags.length,
      languages,
      byType,
      tags: tagsList,
    };
  }
}