// src/config/database/seeders/analytics-seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Analytics } from '../../../analytics/entities/analytics.entity';
import { CategoryWiseProduct } from '../../../analytics/entities/category-wise-product.entity';
import { TopRateProduct } from '../../../analytics/entities/top-rate-product.entity';
import { Product } from '../../../products/entities/product.entity';

@Injectable()
export class AnalyticsSeederService {
  private readonly logger = new Logger(AnalyticsSeederService.name);

  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
    @InjectRepository(CategoryWiseProduct)
    private readonly categoryWiseProductRepository: Repository<CategoryWiseProduct>,
    @InjectRepository(TopRateProduct)
    private readonly topRateProductRepository: Repository<TopRateProduct>,
  ) {}

  async seed() {
    this.logger.log('🌱 Starting analytics seeder...');

    try {
      await this.seedAnalytics();
      await this.seedCategoryWiseProduct();
      await this.seedLowStockProducts();
      await this.seedTopRateProduct();

      this.logger.log('✅ Analytics seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Failed to seed analytics:', error.message);
      throw error;
    }
  }

  private async seedAnalytics() {
    const filePath = await this.findJsonFile('analytics.json');
    if (!filePath) {
      this.logger.error('❌ Could not find analytics.json file');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const analytics = plainToClass(Analytics, data);

      await this.analyticsRepository.clear();
      await this.analyticsRepository.save(this.analyticsRepository.create(analytics));

      this.logger.log(
        `📊 Analytics data loaded: ${JSON.stringify(analytics).substring(
          0,
          100,
        )}...`,
      );
      this.logger.log(`✅ Analytics seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed analytics:', error.message);
    }
  }

  private async seedCategoryWiseProduct() {
    const filePath = await this.findJsonFile('category-wise-product.json');
    if (!filePath) {
      this.logger.error('❌ Could not find category-wise-product.json file');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let categoryProducts: CategoryWiseProduct[];

      // Handle both array and single object
      if (Array.isArray(data)) {
        categoryProducts = plainToClass(CategoryWiseProduct, data);
      } else {
        categoryProducts = [plainToClass(CategoryWiseProduct, data)];
      }

      await this.categoryWiseProductRepository.clear();
      await this.categoryWiseProductRepository.save(
        this.categoryWiseProductRepository.create(categoryProducts),
      );

      this.logger.log(
        `📊 Category wise product data loaded: ${categoryProducts.length} items`,
      );
      this.logger.log(`✅ Category wise products seeded successfully`);
    } catch (error) {
      this.logger.error(
        '❌ Failed to seed category wise products:',
        error.message,
      );
    }
  }

  private async seedLowStockProducts() {
    const filePath = await this.findJsonFile('low-stock-products.json');
    if (!filePath) {
      this.logger.error('❌ Could not find low-stock-products.json file');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let lowStockProducts: Product[];

      // Handle both array and single object
      if (Array.isArray(data)) {
        lowStockProducts = plainToClass(Product, data);
      } else {
        lowStockProducts = [plainToClass(Product, data)];
      }

      this.logger.log(
        `📊 Low stock products data loaded: ${lowStockProducts.length} items`,
      );
      this.logger.log(`✅ Low stock products seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed low stock products:', error.message);
    }
  }

  private async seedTopRateProduct() {
    const filePath = await this.findJsonFile('top-rate-product.json');
    if (!filePath) {
      this.logger.error('❌ Could not find top-rate-product.json file');
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let topRateProducts: TopRateProduct[];

      // Handle both array and single object
      if (Array.isArray(data)) {
        topRateProducts = plainToClass(TopRateProduct, data);
      } else {
        topRateProducts = [plainToClass(TopRateProduct, data)];
      }

      // Preserve source product id from JSON as product_id and let table id auto-generate.
      const normalizedTopRateProducts = topRateProducts.map((item: any) => {
        const { id: sourceProductId, ...rest } = item;
        return {
          ...rest,
          product_id: sourceProductId,
        } as TopRateProduct;
      });

      await this.topRateProductRepository.clear();
      await this.topRateProductRepository.save(
        this.topRateProductRepository.create(normalizedTopRateProducts),
      );

      this.logger.log(
        `📊 Top rate product data loaded: ${topRateProducts.length} items`,
      );
      this.logger.log(`✅ Top rate products seeded successfully`);
    } catch (error) {
      this.logger.error('❌ Failed to seed top rate products:', error.message);
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
      path.join(__dirname, '..', '..', '..', 'db', 'pickbazar', filename),
      path.join(__dirname, '..', '..', '..', '..', 'db', 'pickbazar', filename),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        this.logger.log(`📁 Found ${filename} at: ${p}`);
        return p;
      }
    }

    return this.findJsonFileRecursive(filename);
  }

  private findJsonFileRecursive(
    filename: string,
    startDir: string = process.cwd(),
  ): string | null {
    let currentDir = startDir;
    const maxDepth = 5;
    let depth = 0;

    while (depth < maxDepth) {
      const patterns = [
        path.join(currentDir, 'src', 'db', 'pickbazar', filename),
        path.join(
          currentDir,
          'src',
          'config',
          'database',
          'pickbazar',
          filename,
        ),
        path.join(currentDir, 'api-src-db-pickbazar', filename),
        path.join(currentDir, 'database', 'pickbazar', filename),
        path.join(currentDir, 'db', 'pickbazar', filename),
        path.join(currentDir, 'pickbazar', filename),
      ];

      for (const pattern of patterns) {
        if (fs.existsSync(pattern)) {
          return pattern;
        }
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
      depth++;
    }

    return null;
  }

  async clear() {
    this.logger.log('🧹 Clearing analytics data...');
    await this.topRateProductRepository.clear();
    await this.categoryWiseProductRepository.clear();
    await this.analyticsRepository.clear();
    this.logger.log('✅ Analytics data cleared successfully');
  }

  async seedSpecific(
    type: 'analytics' | 'category' | 'low-stock' | 'top-rate',
  ) {
    this.logger.log(`🎯 Seeding specific type: ${type}`);

    switch (type) {
      case 'analytics':
        await this.seedAnalytics();
        break;
      case 'category':
        await this.seedCategoryWiseProduct();
        break;
      case 'low-stock':
        await this.seedLowStockProducts();
        break;
      case 'top-rate':
        await this.seedTopRateProduct();
        break;
    }
  }
}
