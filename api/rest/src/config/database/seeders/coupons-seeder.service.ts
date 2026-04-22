// src/config/database/seeders/coupons-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Coupon } from '../../../coupons/entities/coupon.entity';

@Injectable()
export class CouponsSeederService {
  private readonly logger = new Logger(CouponsSeederService.name);

  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting coupons seeder...');

    try {
      await this.clear();
      await this.seedCoupons();
      this.logger.log('✅ Coupons seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed coupons:', error.message);
      throw error;
    }
  }

  private async seedCoupons() {
    const filePath = await this.findJsonFile('coupons.json');
    if (!filePath) {
      this.logger.warn('⚠️ Could not find coupons.json file, skipping...');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      this.logger.log(`📊 Coupons data loaded: ${data.length} items`);

      for (const couponData of data) {
        // Convert boolean values to proper types
        const coupon = this.couponRepository.create({
          id: couponData.id,
          code: couponData.code,
          description: couponData.description,
          image: couponData.image,
          type: couponData.type,
          amount: couponData.amount,
          minimum_cart_amount: couponData.minimum_cart_amount || 0,
          active_from: couponData.active_from,
          expire_at: couponData.expire_at,
          is_valid: couponData.is_valid === 1 || couponData.is_valid === true,
          target: couponData.target === 1 || couponData.target === true ? 1 : 0, // Convert boolean to number
          is_approve:
            couponData.is_approve === 1 || couponData.is_approve === true,
          language: couponData.language || 'en',
          translated_languages: couponData.translated_languages || ['en'],
          shop_id: couponData.shop_id,
          user_id: couponData.user_id,
          created_at: couponData.created_at
            ? new Date(couponData.created_at)
            : new Date(),
          updated_at: couponData.updated_at
            ? new Date(couponData.updated_at)
            : new Date(),
        });

        await this.couponRepository.save(coupon);
        this.logger.debug(`   Saved coupon: ${coupon.code} (ID: ${coupon.id})`);
      }

      this.logger.log(`✅ Coupons seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed coupons:', error.message);
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
    this.logger.log('🧹 Clearing coupons data...');

    try {
      await this.couponRepository.createQueryBuilder().delete().execute();

      this.logger.log('✅ Coupons data cleared successfully');
    } catch (error) {
      this.logger.error('❌ Failed to clear coupons data:', error.message);
      throw error;
    }
  }
}
