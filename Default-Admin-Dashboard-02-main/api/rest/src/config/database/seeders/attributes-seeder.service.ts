// src/config/database/seeders/attributes-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Attribute } from '../../../attributes/entities/attribute.entity';
import { AttributeValue } from '../../../attributes/entities/attribute-value.entity';

@Injectable()
export class AttributesSeederService {
  private readonly logger = new Logger(AttributesSeederService.name);

  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeValue)
    private readonly attributeValueRepository: Repository<AttributeValue>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting attributes seeder...');

    try {
      await this.clear();
      await this.seedAttributes();
      this.logger.log('✅ Attributes seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed attributes:', error.message);
      throw error;
    }
  }

  private async seedAttributes() {
    const filePath = await this.findJsonFile('attributes.json');
    if (!filePath) {
      this.logger.warn('⚠️ Could not find attributes.json file, skipping...');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      this.logger.log(`📊 Attributes data loaded: ${data.length} items`);

      // Process each attribute
      for (const attrData of data) {
        // Extract values before saving
        const valuesData = attrData.values || [];
        delete attrData.values;

        // Save attribute
        const attribute = this.attributeRepository.create({
          id: attrData.id,
          name: attrData.name,
          shop_id: attrData.shop_id.toString(),
          slug: attrData.slug,
          language: attrData.language || 'en',
          translated_languages: attrData.translated_languages || ['en'],
          type: attrData.type || null,
          created_at: new Date(),
          updated_at: new Date(),
        });

        const savedAttribute = await this.attributeRepository.save(attribute);
        this.logger.debug(
          `   Saved attribute: ${savedAttribute.name} (ID: ${savedAttribute.id})`,
        );

        // Save attribute values
        if (valuesData.length > 0) {
          const attributeValues = valuesData.map((valData) =>
            this.attributeValueRepository.create({
              id: valData.id,
              value: valData.value,
              meta: valData.meta,
              slug: valData.slug,
              language: valData.language || 'en',
              translated_languages: valData.translated_languages || ['en'],
              shop_id: parseInt(savedAttribute.shop_id),
              attribute_id: savedAttribute.id,
              attribute: savedAttribute,
              created_at: new Date(),
              updated_at: new Date(),
            }),
          );

          await this.attributeValueRepository.save(attributeValues);
          this.logger.debug(
            `   Saved ${attributeValues.length} values for attribute: ${savedAttribute.name}`,
          );
        }
      }

      this.logger.log(`✅ Attributes seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed attributes:', error.message);
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
    this.logger.log('🧹 Clearing attributes data...');

    try {
      await this.attributeValueRepository
        .createQueryBuilder()
        .delete()
        .execute();

      await this.attributeRepository.createQueryBuilder().delete().execute();

      this.logger.log('✅ Attributes data cleared successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clear attributes data:', error.message);
      throw error;
    }
  }
}
