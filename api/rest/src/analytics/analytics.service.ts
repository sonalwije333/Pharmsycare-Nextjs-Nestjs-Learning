// analytics/analytics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { plainToClass } from 'class-transformer';
import { Analytics } from './entities/analytics.entity';
import { CategoryWiseProduct } from './entities/category-wise-product.entity';
import { Product } from 'src/products/entities/product.entity';
import { TopRateProduct } from './entities/top-rate-product.entity';
import { Order, OrderStatusType } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/common/enums/enums';
import { OrderByStatusDto } from './dto/analytics-response.dto';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Maps stored order_status values onto the buckets the dashboard widget reads.
const ORDER_STATUS_TO_BUCKET: Record<string, keyof OrderByStatusDto> = {
  [OrderStatusType.PENDING]: 'pending',
  [OrderStatusType.PROCESSING]: 'processing',
  [OrderStatusType.COMPLETED]: 'complete',
  [OrderStatusType.CANCELLED]: 'cancelled',
  [OrderStatusType.REFUNDED]: 'refunded',
  [OrderStatusType.FAILED]: 'failed',
  [OrderStatusType.AT_LOCAL_FACILITY]: 'localFacility',
  [OrderStatusType.OUT_FOR_DELIVERY]: 'outForDelivery',
};

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private categoryWiseProduct: CategoryWiseProduct[] = [];
  private lowStockProducts: Product[] = [];
  private topRateProduct: TopRateProduct[] = [];

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    this.loadData();
  }

  private loadData() {
    try {
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
    try {
      const orders = await this.ordersRepository.find({
        select: ['id', 'order_status', 'total', 'paid_total', 'created_at'],
      });

      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const daysAgo = (days: number) =>
        new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const revenueOf = (order: Order) =>
        Number(order.paid_total ?? order.total ?? 0) || 0;

      // Revenue should ignore money that never settled.
      const isRevenueOrder = (order: Order) =>
        order.order_status !== OrderStatusType.CANCELLED &&
        order.order_status !== OrderStatusType.FAILED &&
        order.order_status !== OrderStatusType.REFUNDED;

      let totalRevenue = 0;
      let todaysRevenue = 0;
      let totalRefunds = 0;

      const totalYearSaleByMonth = MONTH_NAMES.map((month) => ({
        month,
        total: 0,
      }));

      for (const order of orders) {
        const createdAt = order.created_at ? new Date(order.created_at) : null;

        if (order.order_status === OrderStatusType.REFUNDED) {
          totalRefunds += Number(order.total ?? 0) || 0;
        }

        if (!isRevenueOrder(order)) continue;

        const revenue = revenueOf(order);
        totalRevenue += revenue;

        if (createdAt && createdAt >= startOfToday) {
          todaysRevenue += revenue;
        }
        if (createdAt && createdAt.getFullYear() === now.getFullYear()) {
          totalYearSaleByMonth[createdAt.getMonth()].total += revenue;
        }
      }

      const buildStatusBuckets = (from?: Date): OrderByStatusDto => {
        const buckets: OrderByStatusDto = {
          pending: 0,
          processing: 0,
          complete: 0,
          cancelled: 0,
          refunded: 0,
          failed: 0,
          localFacility: 0,
          outForDelivery: 0,
        };
        for (const order of orders) {
          if (from) {
            const createdAt = order.created_at
              ? new Date(order.created_at)
              : null;
            if (!createdAt || createdAt < from) continue;
          }
          const bucket = ORDER_STATUS_TO_BUCKET[order.order_status];
          if (bucket) {
            buckets[bucket] = (buckets[bucket] ?? 0) + 1;
          }
        }
        return buckets;
      };

      const round = (value: number) => Math.round(value * 100) / 100;

      const [totalShops, totalVendors, newCustomers] = await Promise.all([
        this.shopsRepository.count(),
        this.usersRepository
          .createQueryBuilder('user')
          .where('user.permissions LIKE :role', {
            role: `%${Permission.BRANCH_OWNER}%`,
          })
          .getCount(),
        this.usersRepository
          .createQueryBuilder('user')
          .where('user.permissions LIKE :role', {
            role: `%${Permission.CUSTOMER}%`,
          })
          .andWhere('user.created_at >= :from', { from: daysAgo(30) })
          .getCount(),
      ]);

      const analytics = new Analytics();
      analytics.totalRevenue = round(totalRevenue);
      analytics.todaysRevenue = round(todaysRevenue);
      analytics.totalRefunds = round(totalRefunds);
      analytics.totalOrders = orders.length;
      analytics.totalShops = totalShops;
      analytics.totalVendors = totalVendors;
      analytics.newCustomers = newCustomers;
      analytics.todayTotalOrderByStatus = buildStatusBuckets(startOfToday);
      analytics.weeklyTotalOrderByStatus = buildStatusBuckets(daysAgo(7));
      analytics.monthlyTotalOrderByStatus = buildStatusBuckets(daysAgo(30));
      analytics.yearlyTotalOrderByStatus = buildStatusBuckets(daysAgo(365));
      analytics.totalYearSaleByMonth = totalYearSaleByMonth.map((item) => ({
        month: item.month,
        total: round(item.total),
      }));

      return analytics;
    } catch (error) {
      this.logger.error('❌ Failed to compute analytics:', error.message);
      return new Analytics();
    }
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
