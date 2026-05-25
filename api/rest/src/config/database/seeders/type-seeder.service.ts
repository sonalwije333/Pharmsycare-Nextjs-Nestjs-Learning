// src/config/database/seeders/type-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Type } from '../../../types/entities/type.entity';
import typesJson from '@db/types.json';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TypeSeederService {
  private readonly logger = new Logger(TypeSeederService.name);

  constructor(
    @InjectRepository(Type)
    private typeRepository: Repository<Type>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getTypesData(): Partial<Type>[] {
    const types = plainToClass(Type, typesJson);
    return types.map((type: any) => ({
      id: type.id,
      name: type.name,
      slug: type.slug,
      icon: type.icon,
      banners: type.banners || [],
      promotional_sliders: type.promotional_sliders || [],
      settings: type.settings || {
        isHome: false,
        layoutType: 'classic',
        productCard: 'helium'
      },
      language: type.language || 'en',
      translated_languages: type.translated_languages || ['en'],
      created_at: type.created_at ? new Date(type.created_at) : new Date(),
      updated_at: type.updated_at ? new Date(type.updated_at) : new Date(),
    }));
  }

  async seed(): Promise<void> {
    try {
      this.logger.log('Starting types seeding...');
      
      const types = this.getTypesData();
      
      for (const typeData of types) {
        const existingType = await this.typeRepository.findOne({
          where: { slug: typeData.slug },
        });

        if (!existingType) {
          const newType = this.typeRepository.create(typeData);
          await this.typeRepository.save(newType);
          this.logger.log(`Created type: ${typeData.name} (${typeData.language})`);
        } else {
          this.logger.log(`Type ${typeData.name} already exists`);
        }
      }
      
      this.logger.log('Types seeding completed');
    } catch (error) {
      this.logger.error('Error seeding types:', error);
      throw error;
    }
  }

  async seedByLanguage(language: string): Promise<void> {
    try {
      this.logger.log(`Seeding types for language: ${language}`);
      
      const types = this.getTypesData().filter(t => t.language === language);
      
      for (const typeData of types) {
        const existingType = await this.typeRepository.findOne({
          where: { slug: typeData.slug },
        });

        if (!existingType) {
          const newType = this.typeRepository.create(typeData);
          await this.typeRepository.save(newType);
          this.logger.log(`Created type: ${typeData.name}`);
        }
      }
      
      this.logger.log(`Types for language ${language} seeding completed`);
    } catch (error) {
      this.logger.error(`Error seeding types for language ${language}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.logger.log('Clearing types...');
      await this.typeRepository.clear();
      this.logger.log('Types cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing types:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total: number;
    languages: string[];
    types: Array<{ id: number; name: string; slug: string; language: string }>;
  }> {
    const types = await this.typeRepository.find();
    
    const languages = [...new Set(types.map(t => t.language))];
    const typesList = types.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      language: t.language,
    }));
    
    return {
      total: types.length,
      languages,
      types: typesList,
    };
  }
}