import { useQuery } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { reportingClient, ReportPeriod } from '@/data/client/reporting';

export function useFinancialReportQuery(period: ReportPeriod) {
  return useQuery([API_ENDPOINTS.REPORTING_FINANCIAL, period], () =>
    reportingClient.financial(period),
  );
}

export function useRevenueReportQuery(period: ReportPeriod) {
  return useQuery([API_ENDPOINTS.REPORTING_REVENUE, period], () =>
    reportingClient.revenue(period),
  );
}

export function usePaymentsReportQuery() {
  return useQuery([API_ENDPOINTS.REPORTING_PAYMENTS], () =>
    reportingClient.payments(),
  );
}

export function useSalaryReportQuery() {
  return useQuery([API_ENDPOINTS.REPORTING_SALARIES], () =>
    reportingClient.salaries(),
  );
}

export function useStockReportQuery() {
  return useQuery([API_ENDPOINTS.REPORTING_STOCK], () =>
    reportingClient.stock(),
  );
}

export function useSalesPerformanceReportQuery() {
  return useQuery([API_ENDPOINTS.REPORTING_SALES_PERFORMANCE], () =>
    reportingClient.salesPerformance(),
  );
}
