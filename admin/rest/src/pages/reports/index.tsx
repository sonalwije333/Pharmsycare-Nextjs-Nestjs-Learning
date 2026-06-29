import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import {
  adminAndOwnerOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import { downloadCsv } from '@/utils/download-csv';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import {
  useFinancialReportQuery,
  usePaymentsReportQuery,
  useRevenueReportQuery,
  useSalaryReportQuery,
  useSalesPerformanceReportQuery,
  useStockReportQuery,
} from '@/data/reporting';
import { ReportPeriod } from '@/data/client/reporting';

function formatRs(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function humanize(value: string) {
  return String(value || '')
    .replace(/^(order|payment)-/, '')
    .replace(/[-_]/g, ' ');
}

type ReportTab =
  | 'financial'
  | 'revenue'
  | 'payments'
  | 'salaries'
  | 'stock'
  | 'sales';

const PERIODS: ReportPeriod[] = ['daily', 'weekly', 'monthly'];

export default function ReportsPage() {
  const { permissions } = getAuthCredentials();
  const canSeeSalaries = hasAccess(adminAndOwnerOnly, permissions);

  const tabs: { id: ReportTab; label: string }[] = [
    { id: 'financial', label: 'Financial' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'payments', label: 'Payments' },
    ...(canSeeSalaries
      ? [{ id: 'salaries' as ReportTab, label: 'Salaries' }]
      : []),
    { id: 'stock', label: 'Stock' },
    { id: 'sales', label: 'Sales Performance' },
  ];

  const [tab, setTab] = useState<ReportTab>('financial');
  const [period, setPeriod] = useState<ReportPeriod>('monthly');

  return (
    <>
      <Card className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <PageHeading title="Reports" />
          <p className="mt-2 text-sm text-body">
            Financial, revenue, payment, payroll, stock and sales-performance
            reports for the pharmacy.
          </p>
        </div>
        {(tab === 'financial' || tab === 'revenue') && (
          <div className="flex items-center gap-2">
            {PERIODS.map((option) => (
              <button
                key={option}
                onClick={() => setPeriod(option)}
                className={`h-9 rounded-md border px-3 text-sm capitalize transition ${
                  period === option
                    ? 'border-accent bg-accent text-light'
                    : 'border-border-200 text-body hover:border-accent'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`h-9 rounded-md border px-4 text-sm font-medium transition ${
              tab === item.id
                ? 'border-accent bg-accent text-light'
                : 'border-border-200 bg-light text-body hover:border-accent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'financial' && <FinancialReportView period={period} />}
      {tab === 'revenue' && <RevenueReportView period={period} />}
      {tab === 'payments' && <PaymentsReportView />}
      {tab === 'salaries' && canSeeSalaries && <SalaryReportView />}
      {tab === 'stock' && <StockReportView />}
      {tab === 'sales' && <SalesPerformanceView />}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border-200 p-4">
      <p className="text-xs uppercase text-body">{label}</p>
      <p className="mt-1 text-base font-semibold text-heading">{value}</p>
    </div>
  );
}

function BarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-48 items-end gap-1 overflow-x-auto">
      {data.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="flex min-w-[28px] flex-1 flex-col items-center justify-end gap-1"
          title={`${item.label}: ${formatRs(item.value)}`}
        >
          <div
            className="w-full rounded-t bg-accent/80"
            style={{ height: `${(item.value / max) * 100}%` }}
          />
          <span className="whitespace-nowrap text-[10px] text-body">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ExportButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button variant="outline" onClick={onClick} disabled={disabled} size="small">
      Export CSV
    </Button>
  );
}

function QueryState({
  loading,
  error,
}: {
  loading: boolean;
  error: unknown;
}) {
  if (loading) return <Loader text="Loading report..." />;
  if (error)
    return <ErrorMessage message={(error as Error)?.message ?? 'Error'} />;
  return null;
}

// ── Financial ───────────────────────────────────────────────────────────────
function FinancialReportView({ period }: { period: ReportPeriod }) {
  const { data, isLoading, error } = useFinancialReportQuery(period);
  if (isLoading || error)
    return <QueryState loading={isLoading} error={error} />;
  if (!data) return null;

  function handleExport() {
    const rows: (string | number)[][] = [
      ['Period', 'Revenue', 'Refunds', 'Tax', 'Discount', 'Net', 'Orders'],
      ...data!.rows.map((r) => [
        r.label,
        r.revenue,
        r.refunds,
        r.tax,
        r.discount,
        r.net,
        r.orders,
      ]),
    ];
    downloadCsv(`financial-report-${period}.csv`, rows);
  }

  return (
    <>
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-heading">
            Financial summary ({period})
          </h2>
          <ExportButton onClick={handleExport} />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Revenue" value={formatRs(data.summary.revenue)} />
          <Stat label="Net" value={formatRs(data.summary.net)} />
          <Stat label="Refunds" value={formatRs(data.summary.refunds)} />
          <Stat label="Tax" value={formatRs(data.summary.tax)} />
          <Stat label="Discount" value={formatRs(data.summary.discount)} />
          <Stat label="Orders" value={String(data.summary.orders)} />
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="mb-4 text-base font-semibold text-heading">
          Revenue trend
        </h2>
        <BarChart
          data={data.rows.map((r) => ({ label: r.label, value: r.revenue }))}
        />
      </Card>

      <ReportTable
        title="Breakdown"
        headers={['Period', 'Revenue', 'Refunds', 'Net', 'Orders']}
        rows={data.rows.map((r) => [
          r.label,
          formatRs(r.revenue),
          formatRs(r.refunds),
          formatRs(r.net),
          String(r.orders),
        ])}
      />
    </>
  );
}

// ── Revenue ──────────────────────────────────────────────────────────────────
function RevenueReportView({ period }: { period: ReportPeriod }) {
  const { data, isLoading, error } = useRevenueReportQuery(period);
  if (isLoading || error)
    return <QueryState loading={isLoading} error={error} />;
  if (!data) return null;

  const growth = data.summary.growthPercentage;

  return (
    <>
      <Card className="mb-6">
        <h2 className="mb-4 text-base font-semibold text-heading">
          Revenue tracking ({period})
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <Stat label="Total Revenue" value={formatRs(data.summary.totalRevenue)} />
          <Stat label="Net Revenue" value={formatRs(data.summary.netRevenue)} />
          <Stat label="Current" value={formatRs(data.summary.currentPeriod)} />
          <Stat label="Previous" value={formatRs(data.summary.previousPeriod)} />
          <div className="rounded border border-border-200 p-4">
            <p className="text-xs uppercase text-body">Growth</p>
            <p
              className={`mt-1 text-base font-semibold ${
                growth >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {growth >= 0 ? '+' : ''}
              {growth}%
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-body">
          Best period:{' '}
          <span className="font-semibold text-heading">
            {data.summary.bestPeriodLabel}
          </span>{' '}
          ({formatRs(data.summary.bestPeriodRevenue)})
        </p>
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-heading">
          Revenue by period
        </h2>
        <BarChart
          data={data.rows.map((r) => ({ label: r.label, value: r.revenue }))}
        />
      </Card>
    </>
  );
}

// ── Payments ─────────────────────────────────────────────────────────────────
function PaymentsReportView() {
  const { data, isLoading, error } = usePaymentsReportQuery();
  if (isLoading || error)
    return <QueryState loading={isLoading} error={error} />;
  if (!data) return null;

  return (
    <>
      <Card className="mb-6">
        <h2 className="mb-4 text-base font-semibold text-heading">
          Payment processing
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <Stat label="Transactions" value={String(data.summary.transactions)} />
          <Stat label="Collected" value={formatRs(data.summary.collected)} />
          <Stat label="Succeeded" value={String(data.summary.succeeded)} />
          <Stat label="Pending" value={String(data.summary.pending)} />
          <Stat label="Failed" value={String(data.summary.failed)} />
        </div>
      </Card>

      <ReportTable
        title="By payment gateway"
        headers={['Gateway', 'Transactions', 'Amount']}
        rows={data.byGateway.map((g) => [
          humanize(g.gateway),
          String(g.count),
          formatRs(g.amount),
        ])}
      />
      <div className="mb-6" />
      <ReportTable
        title="By payment status"
        headers={['Status', 'Transactions', 'Amount']}
        rows={data.byStatus.map((s) => [
          humanize(s.status),
          String(s.count),
          formatRs(s.amount),
        ])}
      />
    </>
  );
}

// ── Salaries ─────────────────────────────────────────────────────────────────
function SalaryReportView() {
  const { data, isLoading, error } = useSalaryReportQuery();
  if (isLoading || error)
    return <QueryState loading={isLoading} error={error} />;
  if (!data) return null;

  function handleExport() {
    const rows: (string | number)[][] = [
      ['Employee', 'Email', 'Role', 'Base', 'Allowances', 'Deductions', 'Net'],
      ...data!.rows.map((r) => [
        r.name,
        r.email,
        r.role,
        r.base_salary,
        r.allowances,
        r.deductions,
        r.net_salary,
      ]),
    ];
    downloadCsv(`salary-report-${data!.month.replace(/\s+/g, '-')}.csv`, rows);
  }

  return (
    <>
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-heading">
            Employee salaries — {data.month}
          </h2>
          <ExportButton onClick={handleExport} disabled={!data.rows.length} />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Headcount" value={String(data.summary.headcount)} />
          <Stat label="Gross" value={formatRs(data.summary.gross)} />
          <Stat label="Deductions" value={formatRs(data.summary.deductions)} />
          <Stat label="Net Payroll" value={formatRs(data.summary.net)} />
        </div>
      </Card>

      <ReportTable
        title="Payroll"
        headers={['Employee', 'Role', 'Base', 'Allowances', 'Deductions', 'Net']}
        rows={data.rows.map((r) => [
          r.name,
          r.role,
          formatRs(r.base_salary),
          formatRs(r.allowances),
          formatRs(r.deductions),
          formatRs(r.net_salary),
        ])}
        emptyText="No staff or branch-owner accounts found."
      />
    </>
  );
}

// ── Stock ────────────────────────────────────────────────────────────────────
function StockReportView() {
  const { data, isLoading, error } = useStockReportQuery();
  if (isLoading || error)
    return <QueryState loading={isLoading} error={error} />;
  if (!data) return null;

  function handleExport() {
    const rows: (string | number)[][] = [
      ['Product', 'SKU', 'Quantity', 'Price', 'Stock Value', 'Status'],
      ...data!.rows.map((r) => [
        r.name,
        r.sku ?? '',
        r.quantity,
        r.price,
        r.stock_value,
        r.status,
      ]),
    ];
    downloadCsv('stock-report.csv', rows);
  }

  return (
    <>
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-heading">
            Stock amount report
          </h2>
          <ExportButton onClick={handleExport} disabled={!data.rows.length} />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <Stat label="SKUs" value={String(data.summary.skus)} />
          <Stat label="Units" value={String(data.summary.units)} />
          <Stat label="Stock Value" value={formatRs(data.summary.stockValue)} />
          <Stat label="Out of Stock" value={String(data.summary.outOfStock)} />
          <Stat label="Low Stock" value={String(data.summary.lowStock)} />
        </div>
      </Card>

      <ReportTable
        title="Inventory"
        headers={['Product', 'SKU', 'Quantity', 'Price', 'Stock Value', 'Status']}
        rows={data.rows
          .slice(0, 200)
          .map((r) => [
            r.name,
            r.sku ?? '-',
            String(r.quantity),
            formatRs(r.price),
            formatRs(r.stock_value),
            humanize(r.status),
          ])}
      />
    </>
  );
}

// ── Sales performance ────────────────────────────────────────────────────────
function SalesPerformanceView() {
  const { data, isLoading, error } = useSalesPerformanceReportQuery();
  if (isLoading || error)
    return <QueryState loading={isLoading} error={error} />;
  if (!data) return null;

  return (
    <>
      <Card className="mb-6">
        <h2 className="mb-4 text-base font-semibold text-heading">
          Sales performance
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Orders" value={String(data.summary.orders)} />
          <Stat label="Completed" value={String(data.summary.completed)} />
          <Stat
            label="Completion"
            value={`${data.summary.completionRate}%`}
          />
          <Stat label="Revenue" value={formatRs(data.summary.revenue)} />
          <Stat label="Avg Order" value={formatRs(data.summary.avgOrderValue)} />
          <Stat label="Units Sold" value={String(data.summary.unitsSold)} />
        </div>
      </Card>

      <ReportTable
        title="Top selling products"
        headers={['Product', 'SKU', 'Units Sold', 'Orders', 'Revenue']}
        rows={data.topProducts.map((p) => [
          p.name,
          p.sku ?? '-',
          String(p.sold_quantity),
          String(p.orders_count),
          formatRs(p.revenue),
        ])}
        emptyText="No product sales recorded yet."
      />
    </>
  );
}

function ReportTable({
  title,
  headers,
  rows,
  emptyText = 'No data available.',
}: {
  title: string;
  headers: string[];
  rows: string[][];
  emptyText?: string;
}) {
  return (
    <Card className="overflow-hidden !p-0">
      <div className="border-b px-4 py-3 text-sm font-medium text-heading">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={header}
                  className={`px-4 py-3 ${index === 0 ? '' : 'text-right'}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-dashed">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-4 py-3 ${
                      cellIndex === 0
                        ? 'font-medium text-heading'
                        : 'text-right text-body'
                    }`}
                  >
                    {cellIndex === row.length - 1 &&
                    headers[cellIndex] === 'Status' ? (
                      <Badge
                        text={cell}
                        className="bg-accent/10 capitalize text-accent"
                      />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-body">{emptyText}</p>
      ) : null}
    </Card>
  );
}

ReportsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ReportsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
