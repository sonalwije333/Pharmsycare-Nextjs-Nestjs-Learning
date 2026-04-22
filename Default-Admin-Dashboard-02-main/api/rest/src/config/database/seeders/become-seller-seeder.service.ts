// src/config/database/seeders/become-seller-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { BecomeSeller } from '../../../become-seller/entities/become-seller.entity';

@Injectable()
export class BecomeSellerSeederService {
  private readonly logger = new Logger(BecomeSellerSeederService.name);

  constructor(
    @InjectRepository(BecomeSeller)
    private readonly becomeSellerRepository: Repository<BecomeSeller>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting become seller seeder...');

    try {
      await this.clear();
      await this.seedBecomeSeller();
      this.logger.log('✅ Become seller seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed become seller:', error.message);
      throw error;
    }
  }

  private async seedBecomeSeller() {
    const filePath = await this.findJsonFile('become-seller.json');
    if (!filePath) {
      this.logger.warn(
        '⚠️ Could not find become-seller.json file, skipping...',
      );
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Create the become seller configuration
      const becomeSeller = this.becomeSellerRepository.create({
        page_options: data.page_options,
        commissions: data.commissions || [],
        language: 'en',
      });

      await this.becomeSellerRepository.save(becomeSeller);
      this.logger.log(`✅ Become seller configuration seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed become seller:', error.message);
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
    this.logger.log('🧹 Clearing become seller data...');

    try {
      await this.becomeSellerRepository.createQueryBuilder().delete().execute();

      this.logger.log('✅ Become seller data cleared successfully');
    } catch (error) {
      this.logger.error(
        '❌ Failed to clear become seller data:',
        error.message,
      );
      throw error;
    }
  }
}
