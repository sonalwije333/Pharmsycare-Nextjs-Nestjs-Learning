import { HttpClient } from '@/data/client/http-client';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface FinancialReport {
  period: ReportPeriod;
  summary: {
    revenue: number;
    refunds: number;
    tax: number;
    discount: number;
    net: number;
    orders: number;
    avgOrderValue: number;
  };
  rows: {
    label: string;
    revenue: number;
    refunds: number;
    tax: number;
    discount: number;
    net: number;
    orders: number;
  }[];
}

export interface RevenueReport {
  period: ReportPeriod;
  summary: {
    totalRevenue: number;
    netRevenue: number;
    currentPeriod: number;
    previousPeriod: number;
    growthPercentage: number;
    bestPeriodLabel: string;
    bestPeriodRevenue: number;
  };
  rows: { label: string; revenue: number }[];
}

export interface PaymentsReport {
  summary: {
    transactions: number;
    collected: number;
    succeeded: number;
    pending: number;
    failed: number;
  };
  byGateway: { gateway: string; count: number; amount: number }[];
  byStatus: { status: string; count: number; amount: number }[];
}

export interface SalaryReport {
  month: string;
  summary: { headcount: number; gross: number; deductions: number; net: number };
  rows: {
    id: number;
    name: string;
    email: string;
    role: string;
    base_salary: number;
    allowances: number;
    deductions: number;
    net_salary: number;
  }[];
}

export interface StockReport {
  summary: {
    skus: number;
    units: number;
    stockValue: number;
    outOfStock: number;
    lowStock: number;
  };
  rows: {
    id: number;
    name: string;
    sku: string | null;
    quantity: number;
    price: number;
    stock_value: number;
    status: string;
  }[];
}

export interface SalesPerformanceReport {
  summary: {
    orders: number;
    completed: number;
    completionRate: number;
    revenue: number;
    avgOrderValue: number;
    unitsSold: number;
    shops: number;
  };
  topProducts: {
    id: number;
    name: string;
    sku: string | null;
    sold_quantity: number;
    orders_count: number;
    revenue: number;
  }[];
}

export const reportingClient = {
  financial(period: ReportPeriod) {
    return HttpClient.get<FinancialReport>(API_ENDPOINTS.REPORTING_FINANCIAL, {
      period,
    });
  },
  revenue(period: ReportPeriod) {
    return HttpClient.get<RevenueReport>(API_ENDPOINTS.REPORTING_REVENUE, {
      period,
    });
  },
  payments() {
    return HttpClient.get<PaymentsReport>(API_ENDPOINTS.REPORTING_PAYMENTS);
  },
  salaries() {
    return HttpClient.get<SalaryReport>(API_ENDPOINTS.REPORTING_SALARIES);
  },
  stock() {
    return HttpClient.get<StockReport>(API_ENDPOINTS.REPORTING_STOCK);
  },
  salesPerformance() {
    return HttpClient.get<SalesPerformanceReport>(
      API_ENDPOINTS.REPORTING_SALES_PERFORMANCE,
    );
  },
};
