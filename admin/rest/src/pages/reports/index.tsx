import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge/badge';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useOrdersQuery } from '@/data/order';
import { Order } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { downloadCsv } from '@/utils/download-csv';
import { printHtml } from '@/utils/print-element';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function formatRs(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusLabel(status: string) {
  return String(status || '')
    .replace(/^order-/, '')
    .replace(/-/g, ' ');
}

function orderQty(order: Order) {
  return (order.products ?? []).reduce(
    (sum, product: any) => sum + Number(product?.pivot?.order_quantity ?? 0),
    0,
  );
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const { locale } = useRouter();

  const [startDate, setStartDate] = useState<Date>(
    dayjs().subtract(29, 'day').startOf('day').toDate(),
  );
  const [endDate, setEndDate] = useState<Date>(dayjs().endOf('day').toDate());
  const [status, setStatus] = useState('');

  const { orders, loading, error } = useOrdersQuery({
    language: locale,
    limit: 1000,
    page: 1,
  });

  const filtered = useMemo(() => {
    const from = dayjs(startDate).startOf('day');
    const to = dayjs(endDate).endOf('day');
    return (orders ?? []).filter((order) => {
      const created = dayjs(order.created_at);
      const inRange =
        created.isAfter(from.subtract(1, 'ms')) &&
        created.isBefore(to.add(1, 'ms'));
      const statusOk = status ? order.order_status === status : true;
      return inRange && statusOk;
    });
  }, [orders, startDate, endDate, status]);

  const summary = useMemo(() => {
    const revenue = filtered.reduce(
      (sum, o) => sum + Number(o.paid_total ?? 0),
      0,
    );
    const tax = filtered.reduce((sum, o) => sum + Number(o.sales_tax ?? 0), 0);
    const discount = filtered.reduce(
      (sum, o) => sum + Number(o.discount ?? 0),
      0,
    );
    const items = filtered.reduce((sum, o) => sum + orderQty(o), 0);
    return {
      orders: filtered.length,
      revenue,
      tax,
      discount,
      items,
      avg: filtered.length ? revenue / filtered.length : 0,
    };
  }, [filtered]);

  const statusBreakdown = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    filtered.forEach((o) => {
      const key = o.order_status || 'unknown';
      if (!map[key]) map[key] = { count: 0, revenue: 0 };
      map[key].count += 1;
      map[key].revenue += Number(o.paid_total ?? 0);
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [filtered]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    (orders ?? []).forEach((o) => o.order_status && set.add(o.order_status));
    return Array.from(set);
  }, [orders]);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const rangeLabel = `${dayjs(startDate).format('MMM DD, YYYY')} – ${dayjs(
    endDate,
  ).format('MMM DD, YYYY')}`;

  function handleExport() {
    const rows: (string | number)[][] = [
      [
        'Order #',
        'Date',
        'Customer',
        'Items',
        'Status',
        'Payment',
        'Subtotal',
        'Discount',
        'Tax',
        'Total',
      ],
      ...filtered.map((o) => [
        o.tracking_number,
        dayjs(o.created_at).format('YYYY-MM-DD HH:mm'),
        o.customer_name ?? '',
        orderQty(o),
        statusLabel(o.order_status),
        o.payment_gateway ?? '',
        Number(o.amount ?? 0).toFixed(2),
        Number(o.discount ?? 0).toFixed(2),
        Number(o.sales_tax ?? 0).toFixed(2),
        Number(o.paid_total ?? 0).toFixed(2),
      ]),
    ];
    rows.push([]);
    rows.push(['Summary', rangeLabel]);
    rows.push(['Total Orders', summary.orders]);
    rows.push(['Total Revenue', summary.revenue.toFixed(2)]);
    rows.push(['Items Sold', summary.items]);
    downloadCsv(
      `sales-report-${dayjs(startDate).format('YYYYMMDD')}-${dayjs(
        endDate,
      ).format('YYYYMMDD')}.csv`,
      rows,
    );
  }

  function handlePrint() {
    const rowsHtml = filtered
      .map(
        (o) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee">${
            o.tracking_number
          }</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee">${dayjs(
            o.created_at,
          ).format('MMM DD, YYYY')}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee">${
            o.customer_name ?? '-'
          }</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${orderQty(
            o,
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-transform:capitalize">${statusLabel(
            o.order_status,
          )}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${formatRs(
            Number(o.paid_total ?? 0),
          )}</td>
        </tr>`,
      )
      .join('');

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:800px;margin:0 auto">
        <h1 style="font-size:20px;margin:0">Sales Report</h1>
        <p style="margin:4px 0 16px;color:#555">${rangeLabel}</p>
        <div style="display:flex;gap:24px;margin-bottom:16px;font-size:13px">
          <div><strong>${summary.orders}</strong><br/>Orders</div>
          <div><strong>${formatRs(
            summary.revenue,
          )}</strong><br/>Revenue</div>
          <div><strong>${summary.items}</strong><br/>Items Sold</div>
          <div><strong>${formatRs(summary.avg)}</strong><br/>Avg Order</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#f3f4f6;text-align:left">
              <th style="padding:6px 8px">Order #</th>
              <th style="padding:6px 8px">Date</th>
              <th style="padding:6px 8px">Customer</th>
              <th style="padding:6px 8px;text-align:center">Items</th>
              <th style="padding:6px 8px">Status</th>
              <th style="padding:6px 8px;text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
    printHtml(html, 'Sales Report');
  }

  return (
    <>
      <Card className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <PageHeading title="Reports" />
            <p className="mt-2 text-sm text-body">
              Generate sales reports for a date range. Export to CSV or print.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-body">
                From
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => date && setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                dateFormat="MMM dd, yyyy"
                className="h-10 w-36 rounded-md border border-border-200 px-3 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-body">
                To
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => date && setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="MMM dd, yyyy"
                className="h-10 w-36 rounded-md border border-border-200 px-3 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-body">
                Status
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-md border border-border-200 px-3 text-sm capitalize focus:border-accent focus:outline-none"
              >
                <option value="">All</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {statusLabel(option)}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filtered.length === 0}
            >
              Export CSV
            </Button>
            <Button onClick={handlePrint} disabled={filtered.length === 0}>
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Stat label="Orders" value={String(summary.orders)} />
          <Stat label="Revenue" value={formatRs(summary.revenue)} />
          <Stat label="Items Sold" value={String(summary.items)} />
          <Stat label="Avg Order" value={formatRs(summary.avg)} />
          <Stat label="Discounts" value={formatRs(summary.discount)} />
          <Stat label="Tax" value={formatRs(summary.tax)} />
        </div>
      </Card>

      {statusBreakdown.length ? (
        <Card className="mb-8">
          <h2 className="mb-4 text-base font-semibold text-heading">
            By Status
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {statusBreakdown.map(([key, value]) => (
              <div
                key={key}
                className="rounded border border-border-200 p-3"
              >
                <p className="text-xs capitalize text-body">
                  {statusLabel(key)}
                </p>
                <p className="mt-1 text-lg font-semibold text-heading">
                  {value.count}
                </p>
                <p className="text-xs text-accent">
                  {formatRs(value.revenue)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden !p-0">
        <div className="border-b px-4 py-3 text-sm font-medium text-heading">
          Orders — {rangeLabel} ({filtered.length})
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-dashed">
                  <td className="px-4 py-3 font-medium text-heading">
                    {order.tracking_number}
                  </td>
                  <td className="px-4 py-3 text-xs text-body">
                    {dayjs(order.created_at).format('MMM DD, YYYY')}
                  </td>
                  <td className="px-4 py-3 text-body">
                    {order.customer_name ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-heading">{orderQty(order)}</td>
                  <td className="px-4 py-3 text-body">
                    {order.payment_gateway ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      text={statusLabel(order.order_status)}
                      className="bg-accent/10 capitalize text-accent"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-heading">
                    {formatRs(Number(order.paid_total ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-body">
            No orders found for the selected range.
          </p>
        ) : null}
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border-200 p-3">
      <p className="text-xs uppercase text-body">{label}</p>
      <p className="mt-1 text-base font-semibold text-heading">{value}</p>
    </div>
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
