// src/config/database/seeders/manufacturer-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manufacturer } from '../../../manufacturers/entities/manufacturer.entity';
import manufacturersJson from '@db/manufacturers.json';

@Injectable()
export class ManufacturerSeederService {
  private readonly logger = new Logger(ManufacturerSeederService.name);

  private normalizeSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  private mapManufacturersWithUniqueFields(source: any[]): Manufacturer[] {
    const usedNames = new Set<string>();
    const usedSlugs = new Set<string>();

    return source.map((item, index) => {
      const manufacturer = new Manufacturer();

      const rawName = item.name?.trim() || `Manufacturer_${item.id || index + 1}`;
      let name = rawName;
      let nameCounter = 1;
      while (usedNames.has(name.toLowerCase())) {
        name = `${rawName}-${nameCounter++}`;
      }
      usedNames.add(name.toLowerCase());

      const baseSlugSource = item.slug?.trim() || rawName || `manufacturer-${item.id || index + 1}`;
      const baseSlug = this.normalizeSlug(baseSlugSource) || `manufacturer-${item.id || index + 1}`;
      let slug = baseSlug;
      let slugCounter = 1;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${slugCounter++}`;
      }
      usedSlugs.add(slug);

      manufacturer.name = name;
      manufacturer.slug = slug;
      manufacturer.description = item.description || null;
      manufacturer.website = item.website || null;
      manufacturer.products_count = item.products_count || 0;
      manufacturer.is_approved = item.is_approved === 1;
      manufacturer.language = item.language || 'en';
      manufacturer.translated_languages = item.translated_languages || ['en'];
      manufacturer.cover_image = item.cover_image || null;
      manufacturer.image = item.image || null;
      manufacturer.socials = item.socials || null;

      if (item.type && item.type.id) {
        manufacturer.type_id = item.type.id;
      }

      return manufacturer;
    });
  }

  constructor(
    @InjectRepository(Manufacturer)
    private manufacturerRepository: Repository<Manufacturer>,
  ) {}

  async seed() {
    try {
      this.logger.log('🌾 Starting manufacturer seeding...');
      
      // First, clear existing data to avoid conflicts
      await this.clear();
      
      // Map JSON data to Manufacturer entities with guaranteed unique name/slug
      const manufacturers = this.mapManufacturersWithUniqueFields(manufacturersJson);

      // Save manufacturers to database
      const savedManufacturers = await this.manufacturerRepository.save(manufacturers);
      
      this.logger.log(`✅ Successfully seeded ${savedManufacturers.length} manufacturers`);
      
      // Log manufacturer details
      savedManufacturers.forEach(manufacturer => {
        this.logger.debug(`   - ID: ${manufacturer.id}, Name: ${manufacturer.name}, Slug: ${manufacturer.slug}, Products: ${manufacturer.products_count}`);
      });
      
      return savedManufacturers;
    } catch (error) {
      this.logger.error(`❌ Failed to seed manufacturers: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  async clear() {
    try {
      this.logger.log('🗑️ Clearing manufacturers...');
      
      // Truncate table to reset auto-increment
      await this.manufacturerRepository.query('SET FOREIGN_KEY_CHECKS = 0');
      const result = await this.manufacturerRepository.clear();
      await this.manufacturerRepository.query('SET FOREIGN_KEY_CHECKS = 1');
      
      this.logger.log(`✅ Cleared manufacturers table`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to clear manufacturers: ${error.message}`);
      throw error;
    }
  }

  async seedSpecific(type: string) {
    const filteredManufacturers = manufacturersJson.filter(item => {
      switch (type) {
        case 'books':
          return item.type?.slug === 'books';
        case 'gadgets':
          return item.type?.slug === 'gadget';
        case 'medicine':
          return item.type?.slug === 'medicine';
        default:
          return true;
      }
    });

    const manufacturers = this.mapManufacturersWithUniqueFields(filteredManufacturers);

    const saved = await this.manufacturerRepository.save(manufacturers);
    this.logger.log(`✅ Seeded ${saved.length} ${type} manufacturers`);
    return saved;
  }
}