// src/config/database/seeders/flash-sale-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { FlashSale } from '../../../flash-sale/entities/flash-sale.entity';

@Injectable()
export class FlashSaleSeederService {
  private readonly logger = new Logger(FlashSaleSeederService.name);

  constructor(
    @InjectRepository(FlashSale)
    private readonly flashSaleRepository: Repository<FlashSale>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting flash sale seeder...');

    try {
      await this.clear();
      await this.seedFlashSales();
      this.logger.log('✅ Flash sale seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed flash sales:', error.message);
      throw error;
    }
  }

  private async seedFlashSales() {
    const filePath = await this.findJsonFile('flash-sale.json');
    if (!filePath) {
      this.logger.warn('⚠️ Could not find flash-sale.json file, skipping...');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      this.logger.log(`📊 Flash sale data loaded: ${data.length} items`);

      for (const flashSaleData of data) {
        // Extract product IDs from products array if available
        let productIds: number[] = [];
        if (flashSaleData.products && Array.isArray(flashSaleData.products)) {
          productIds = flashSaleData.products.map((p) => p.id);
        }

        const flashSale = this.flashSaleRepository.create({
          id: flashSaleData.id,
          title: flashSaleData.title,
          slug: flashSaleData.slug,
          description: flashSaleData.description,
          start_date: flashSaleData.start_date,
          end_date: flashSaleData.end_date,
          image: flashSaleData.image,
          cover_image: flashSaleData.cover_image,
          type: flashSaleData.type,
          rate: flashSaleData.rate,
          sale_status:
            flashSaleData.sale_status === 1 ||
            flashSaleData.sale_status === true,
          sale_builder: flashSaleData.sale_builder,
          product_ids: productIds,
          language: flashSaleData.language || 'en',
          translated_languages: flashSaleData.translated_languages || ['en'],
          created_at: flashSaleData.created_at
            ? new Date(flashSaleData.created_at)
            : new Date(),
          updated_at: flashSaleData.updated_at
            ? new Date(flashSaleData.updated_at)
            : new Date(),
        });

        await this.flashSaleRepository.save(flashSale);
        this.logger.debug(
          `   Saved flash sale: ${flashSale.title} (ID: ${flashSale.id})`,
        );
      }

      this.logger.log(`✅ Flash sales seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed flash sales:', error.message);
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
    this.logger.log('🧹 Clearing flash sale data...');

    try {
      await this.flashSaleRepository.createQueryBuilder().delete().execute();

      this.logger.log('✅ Flash sale data cleared successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clear flash sale data:', error.message);
      throw error;
    }
  }
}
