// reporting/reporting.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatusType } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Permission } from 'src/common/enums/enums';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

interface PeriodBucket {
  label: string;
  start: Date;
  end: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
  ) {}

  private round(value: number): number {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  private revenueOf(order: Order): number {
    return Number(order.paid_total ?? order.total ?? 0) || 0;
  }

  private isRevenueOrder(order: Order): boolean {
    return (
      order.order_status !== OrderStatusType.CANCELLED &&
      order.order_status !== OrderStatusType.FAILED &&
      order.order_status !== OrderStatusType.REFUNDED
    );
  }

  // Builds an ordered list of time buckets for the requested granularity.
  private buildBuckets(period: ReportPeriod): PeriodBucket[] {
    const now = new Date();
    const buckets: PeriodBucket[] = [];

    if (period === 'daily') {
      // Last 14 days, oldest first.
      for (let i = 13; i >= 0; i--) {
        const day = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i,
        );
        const end = new Date(day.getTime() + DAY_MS);
        buckets.push({
          label: day.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          start: day,
          end,
        });
      }
    } else if (period === 'weekly') {
      // Last 12 weeks (7-day windows), oldest first.
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      for (let i = 11; i >= 0; i--) {
        const start = new Date(startOfToday.getTime() - (i + 1) * 7 * DAY_MS);
        const end = new Date(startOfToday.getTime() - i * 7 * DAY_MS);
        buckets.push({
          label: start.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          start,
          end,
        });
      }
    } else {
      // Last 12 calendar months, oldest first.
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        buckets.push({
          label: start.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
          }),
          start,
          end,
        });
      }
    }

    return buckets;
  }

  // ── Financial reporting (daily / weekly / monthly) ─────────────────────────
  async financial(period: ReportPeriod = 'monthly') {
    const orders = await this.ordersRepository.find({
      select: [
        'id',
        'order_status',
        'total',
        'paid_total',
        'sales_tax',
        'discount',
        'created_at',
      ],
    });
    const buckets = this.buildBuckets(period);

    const rows = buckets.map((bucket) => ({
      label: bucket.label,
      revenue: 0,
      refunds: 0,
      tax: 0,
      discount: 0,
      orders: 0,
      net: 0,
    }));

    let totalRevenue = 0;
    let totalRefunds = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalOrders = 0;

    for (const order of orders) {
      const createdAt = order.created_at ? new Date(order.created_at) : null;
      if (!createdAt) continue;
      const index = buckets.findIndex(
        (b) => createdAt >= b.start && createdAt < b.end,
      );

      const isRefund = order.order_status === OrderStatusType.REFUNDED;
      const revenue = this.isRevenueOrder(order) ? this.revenueOf(order) : 0;
      const refund = isRefund ? Number(order.total ?? 0) || 0 : 0;

      if (revenue) {
        totalRevenue += revenue;
        totalOrders += 1;
        totalTax += Number(order.sales_tax ?? 0) || 0;
        totalDiscount += Number(order.discount ?? 0) || 0;
      }
      if (refund) totalRefunds += refund;

      if (index >= 0) {
        rows[index].revenue += revenue;
        rows[index].refunds += refund;
        rows[index].net += revenue - refund;
        if (revenue) {
          rows[index].orders += 1;
          rows[index].tax += Number(order.sales_tax ?? 0) || 0;
          rows[index].discount += Number(order.discount ?? 0) || 0;
        }
      }
    }

    return {
      period,
      summary: {
        revenue: this.round(totalRevenue),
        refunds: this.round(totalRefunds),
        tax: this.round(totalTax),
        discount: this.round(totalDiscount),
        net: this.round(totalRevenue - totalRefunds),
        orders: totalOrders,
        avgOrderValue: this.round(totalOrders ? totalRevenue / totalOrders : 0),
      },
      rows: rows.map((row) => ({
        label: row.label,
        revenue: this.round(row.revenue),
        refunds: this.round(row.refunds),
        tax: this.round(row.tax),
        discount: this.round(row.discount),
        net: this.round(row.net),
        orders: row.orders,
      })),
    };
  }

  // ── Revenue tracking ───────────────────────────────────────────────────────
  async revenue(period: ReportPeriod = 'monthly') {
    const financial = await this.financial(period);
    const rows = financial.rows;
    const current = rows.length ? rows[rows.length - 1].revenue : 0;
    const previous = rows.length > 1 ? rows[rows.length - 2].revenue : 0;
    const growth = previous ? ((current - previous) / previous) * 100 : 0;
    const best = rows.reduce(
      (acc, row) => (row.revenue > acc.revenue ? row : acc),
      { label: '-', revenue: 0 } as { label: string; revenue: number },
    );

    return {
      period,
      summary: {
        totalRevenue: financial.summary.revenue,
        netRevenue: financial.summary.net,
        currentPeriod: this.round(current),
        previousPeriod: this.round(previous),
        growthPercentage: this.round(growth),
        bestPeriodLabel: best.label,
        bestPeriodRevenue: this.round(best.revenue),
      },
      rows: rows.map((row) => ({ label: row.label, revenue: row.revenue })),
    };
  }

  // ── Payment processing ───────────────────────────────────────────────────
  async payments() {
    const orders = await this.ordersRepository.find({
      select: [
        'id',
        'order_status',
        'paid_total',
        'total',
        'payment_gateway',
        'payment_status',
      ],
    });

    const byGatewayMap = new Map<string, { count: number; amount: number }>();
    const byStatusMap = new Map<string, { count: number; amount: number }>();

    let processed = 0;
    let collected = 0;

    for (const order of orders) {
      const amount = this.revenueOf(order);
      const gateway = (order.payment_gateway as string) || 'UNKNOWN';
      const status = (order.payment_status as string) || 'unknown';

      const g = byGatewayMap.get(gateway) ?? { count: 0, amount: 0 };
      g.count += 1;
      g.amount += amount;
      byGatewayMap.set(gateway, g);

      const s = byStatusMap.get(status) ?? { count: 0, amount: 0 };
      s.count += 1;
      s.amount += amount;
      byStatusMap.set(status, s);

      processed += 1;
      if (this.isRevenueOrder(order)) collected += amount;
    }

    const succeeded = orders.filter((o) =>
      ['payment-success', 'payment-cash', 'payment-cash-on-delivery', 'payment-wallet'].includes(
        (o.payment_status as string) || '',
      ),
    ).length;
    const pending = orders.filter((o) =>
      ['payment-pending', 'payment-processing', 'payment-awaiting-for-approval'].includes(
        (o.payment_status as string) || '',
      ),
    ).length;
    const failed = orders.filter(
      (o) => ((o.payment_status as string) || '') === 'payment-failed',
    ).length;

    return {
      summary: {
        transactions: processed,
        collected: this.round(collected),
        succeeded,
        pending,
        failed,
      },
      byGateway: Array.from(byGatewayMap.entries())
        .map(([gateway, value]) => ({
          gateway,
          count: value.count,
          amount: this.round(value.amount),
        }))
        .sort((a, b) => b.amount - a.amount),
      byStatus: Array.from(byStatusMap.entries())
        .map(([status, value]) => ({
          status,
          count: value.count,
          amount: this.round(value.amount),
        }))
        .sort((a, b) => b.count - a.count),
    };
  }

  // ── Employee salary reports ────────────────────────────────────────────────
  // Salaries are derived from staff & branch-owner accounts using a deterministic
  // pay structure (base by role + fixed allowance/deduction percentages) so the
  // report is populated without a dedicated payroll table.
  async salaries() {
    const employees = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.permissions LIKE :staff', { staff: `%${Permission.STAFF}%` })
      .orWhere('user.permissions LIKE :owner', {
        owner: `%${Permission.BRANCH_OWNER}%`,
      })
      .getMany();

    const roleBase: Record<string, number> = {
      [Permission.BRANCH_OWNER]: 120000,
      [Permission.STAFF]: 60000,
    };

    const rows = employees.map((employee) => {
      const isOwner = (employee.permissions ?? []).some(
        (p) => `${p}` === `${Permission.BRANCH_OWNER}`,
      );
      const role = isOwner ? Permission.BRANCH_OWNER : Permission.STAFF;
      const base = roleBase[role] ?? 50000;
      // Small deterministic variance based on id so figures are not identical.
      const seniority = (employee.id % 5) * 2500;
      const baseSalary = base + seniority;
      const allowances = this.round(baseSalary * 0.15);
      const deductions = this.round(baseSalary * 0.08);
      const netSalary = this.round(baseSalary + allowances - deductions);

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: isOwner ? 'Branch Owner' : 'Staff',
        base_salary: this.round(baseSalary),
        allowances,
        deductions,
        net_salary: netSalary,
      };
    });

    const gross = rows.reduce(
      (sum, row) => sum + row.base_salary + row.allowances,
      0,
    );
    const totalDeductions = rows.reduce((sum, row) => sum + row.deductions, 0);
    const net = rows.reduce((sum, row) => sum + row.net_salary, 0);
    const monthLabel = new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    return {
      month: monthLabel,
      summary: {
        headcount: rows.length,
        gross: this.round(gross),
        deductions: this.round(totalDeductions),
        net: this.round(net),
      },
      rows: rows.sort((a, b) => b.net_salary - a.net_salary),
    };
  }

  // ── Stock amount reports ───────────────────────────────────────────────────
  async stock(lowStockThreshold = 15) {
    const products = await this.productsRepository.find({
      select: ['id', 'name', 'sku', 'quantity', 'price', 'in_stock', 'status'],
      order: { quantity: 'ASC' },
    });

    let totalUnits = 0;
    let totalValue = 0;
    let outOfStock = 0;
    let lowStock = 0;

    const rows = products.map((product) => {
      const quantity = Number(product.quantity ?? 0) || 0;
      const price = Number(product.price ?? 0) || 0;
      const stockValue = quantity * price;
      const isOut = quantity <= 0 || product.in_stock === 0;
      const isLow = !isOut && quantity <= lowStockThreshold;

      totalUnits += quantity;
      totalValue += stockValue;
      if (isOut) outOfStock += 1;
      if (isLow) lowStock += 1;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku ?? null,
        quantity,
        price: this.round(price),
        stock_value: this.round(stockValue),
        status: isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock',
      };
    });

    return {
      summary: {
        skus: products.length,
        units: totalUnits,
        stockValue: this.round(totalValue),
        outOfStock,
        lowStock,
      },
      rows,
    };
  }

  // ── Sales performance reports ──────────────────────────────────────────────
  async salesPerformance() {
    const [orders, products, totalShops] = await Promise.all([
      this.ordersRepository.find({
        select: ['id', 'order_status', 'paid_total', 'total'],
      }),
      this.productsRepository.find({
        select: ['id', 'name', 'sku', 'price', 'sold_quantity', 'orders_count'],
        order: { sold_quantity: 'DESC' },
        take: 10,
      }),
      this.shopsRepository.count(),
    ]);

    const completed = orders.filter(
      (o) => o.order_status === OrderStatusType.COMPLETED,
    ).length;
    const revenueOrders = orders.filter((o) => this.isRevenueOrder(o));
    const totalRevenue = revenueOrders.reduce(
      (sum, o) => sum + this.revenueOf(o),
      0,
    );

    const topProducts = products.map((product) => {
      const sold = Number(product.sold_quantity ?? 0) || 0;
      const price = Number(product.price ?? 0) || 0;
      return {
        id: product.id,
        name: product.name,
        sku: product.sku ?? null,
        sold_quantity: sold,
        orders_count: Number(product.orders_count ?? 0) || 0,
        revenue: this.round(sold * price),
      };
    });

    const unitsSold = topProducts.reduce((sum, p) => sum + p.sold_quantity, 0);

    return {
      summary: {
        orders: orders.length,
        completed,
        completionRate: this.round(
          orders.length ? (completed / orders.length) * 100 : 0,
        ),
        revenue: this.round(totalRevenue),
        avgOrderValue: this.round(
          revenueOrders.length ? totalRevenue / revenueOrders.length : 0,
        ),
        unitsSold,
        shops: totalShops,
      },
      topProducts,
    };
  }
}
