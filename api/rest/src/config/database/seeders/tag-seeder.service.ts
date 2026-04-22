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
    return [
      {
        name: 'Electronics',
        details: 'Electronic products and gadgets',
        icon: 'fa-microchip',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Fashion',
        details: 'Clothing and accessories',
        icon: 'fa-tshirt',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Books',
        details: 'Books and publications',
        icon: 'fa-book',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Home & Garden',
        details: 'Home decor and garden supplies',
        icon: 'fa-home',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Sports',
        details: 'Sports equipment and apparel',
        icon: 'fa-futbol',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Toys',
        details: 'Toys and games for all ages',
        icon: 'fa-puzzle-piece',
        language: 'en',
        translated_languages: ['en'],
      },
      {
        name: 'Automotive',
        details: 'Car parts and accessories',
        icon: 'fa-car',
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