// analytics/analytics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { plainToClass } from 'class-transformer';
import { Analytics } from './entities/analytics.entity';
import { CategoryWiseProduct } from './entities/category-wise-product.entity';
import { Product } from 'src/products/entities/product.entity';
import { TopRateProduct } from './entities/top-rate-product.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private analytics: Analytics;
  private categoryWiseProduct: CategoryWiseProduct[] = [];
  private lowStockProducts: Product[] = [];
  private topRateProduct: TopRateProduct[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      // Load analytics data (single object)
      const analyticsPath = this.findJsonFile('analytics.json');
      if (analyticsPath) {
        const analyticsData = JSON.parse(
          fs.readFileSync(analyticsPath, 'utf8'),
        );
        this.analytics = plainToClass(Analytics, analyticsData);
        this.logger.log('✅ Analytics data loaded successfully');
      }

      // Load category wise product data (array)
      const categoryPath = this.findJsonFile('category-wise-product.json');
      if (categoryPath) {
        const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
        // Handle both array and single object
        if (Array.isArray(categoryData)) {
          this.categoryWiseProduct = plainToClass(
            CategoryWiseProduct,
            categoryData,
          );
        } else {
          this.categoryWiseProduct = [
            plainToClass(CategoryWiseProduct, categoryData),
          ];
        }
        this.logger.log(
          `✅ Category wise product data loaded: ${this.categoryWiseProduct.length} items`,
        );
      }

      // Load low stock products data (array)
      const lowStockPath = this.findJsonFile('low-stock-products.json');
      if (lowStockPath) {
        const lowStockData = JSON.parse(fs.readFileSync(lowStockPath, 'utf8'));
        // Handle both array and single object
        if (Array.isArray(lowStockData)) {
          this.lowStockProducts = plainToClass(Product, lowStockData);
        } else {
          this.lowStockProducts = [plainToClass(Product, lowStockData)];
        }
        this.logger.log(
          `✅ Low stock products data loaded: ${this.lowStockProducts.length} items`,
        );
      }

      // Load top rate product data (array)
      const topRatePath = this.findJsonFile('top-rate-product.json');
      if (topRatePath) {
        const topRateData = JSON.parse(fs.readFileSync(topRatePath, 'utf8'));
        // Handle both array and single object
        if (Array.isArray(topRateData)) {
          this.topRateProduct = plainToClass(TopRateProduct, topRateData);
        } else {
          this.topRateProduct = [plainToClass(TopRateProduct, topRateData)];
        }
        this.logger.log(
          `✅ Top rate product data loaded: ${this.topRateProduct.length} items`,
        );
      }
    } catch (error) {
      this.logger.error('❌ Failed to load analytics data:', error.message);
    }
  }

  private findJsonFile(filename: string): string | null {
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
      path.join(__dirname, '..', '..', 'db', 'pickbazar', filename),
      path.join(__dirname, '..', '..', '..', 'db', 'pickbazar', filename),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return null;
  }

  async findAll(): Promise<Analytics> {
    if (!this.analytics) {
      this.logger.warn('⚠️ No analytics data available');
      return new Analytics();
    }
    return this.analytics;
  }

  async findAllCategoryWiseProduct(): Promise<CategoryWiseProduct[]> {
    if (!this.categoryWiseProduct || this.categoryWiseProduct.length === 0) {
      this.logger.warn('⚠️ No category wise product data available');
      return [];
    }
    return this.categoryWiseProduct;
  }

  async findAllLowStockProducts(): Promise<Product[]> {
    if (!this.lowStockProducts || this.lowStockProducts.length === 0) {
      this.logger.warn('⚠️ No low stock products data available');
      return [];
    }
    return this.lowStockProducts;
  }

  async findAllTopRateProduct(): Promise<TopRateProduct[]> {
    if (!this.topRateProduct || this.topRateProduct.length === 0) {
      this.logger.warn('⚠️ No top rate product data available');
      return [];
    }
    return this.topRateProduct;
  }
}
