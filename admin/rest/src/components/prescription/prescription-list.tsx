import Pagination from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import TitleWithSort from '@/components/ui/title-with-sort';
import { MappedPaginatorInfo, SortOrder } from '@/types';
import { Prescription } from '@/data/client/prescription';
import { NoDataFound } from '@/components/icons/no-data-found';
import { useIsRTL } from '@/utils/locals';
import Badge from '../ui/badge/badge';
// import { ActionButtons } from '@/components/common/action-buttons';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

interface IProps {
  prescriptions: Prescription[] | undefined;
  pagination: MappedPaginatorInfo | null;
  loading?: boolean;
  onPageChange: (current: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}
  prescriptions,
  pagination,
  loading,
  onPageChange,
  onApprove,
  onReject,
  onDelete,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();
  const [sortingObj, setSortingObj] = useState<{
    sort: SortOrder;
    column: string | null;
  }>({
    sort: SortOrder.Desc,
    column: null,
  });

  const onHeaderClick = (column: string | null) => ({
    onClick: () => {
      setSortingObj({
        sort:
          sortingObj.sort === SortOrder.Desc ? SortOrder.Asc : SortOrder.Desc,
        column: column,
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-accent/10 !text-accent';
      case 'rejected':
        return 'bg-status-failed/10 text-status-failed';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'expired':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const columns = [
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-id')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'id'
          }
          isActive={sortingObj.column === 'id'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 100,
      onHeaderCell: () => onHeaderClick('id'),
      render: (id: number) => `#${id}`,
    },
    {
      title: t('table:table-item-customer-name'),
      dataIndex: 'customer_id',
      key: 'customer_id',
      width: 150,
      render: (customer_id: number) => `Customer #${customer_id}`,
    },
    {
      title: t('table:table-item-doctor-name'),
      dataIndex: 'doctor_name',
      key: 'doctor_name',
      width: 150,
      render: (doctor_name: string) => doctor_name || '-',
    },
    {
      title: t('table:table-item-hospital'),
      dataIndex: 'hospital_name',
      key: 'hospital_name',
      width: 150,
      render: (hospital_name: string) => hospital_name || '-',
    },
    {
      title: t('table:table-item-prescription-date'),
      dataIndex: 'prescription_date',
      key: 'prescription_date',
      width: 150,
      render: (prescription_date: string) =>
        prescription_date
          ? dayjs(prescription_date).format('MMM DD, YYYY')
          : '-',
    },
    {
      title: t('table:table-item-expiry-date'),
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 150,
      render: (expiry_date: string) =>
        expiry_date ? dayjs(expiry_date).format('MMM DD, YYYY') : '-',
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-status')}
          ascending={
            sortingObj.sort === SortOrder.Asc && sortingObj.column === 'status'
          }
          isActive={sortingObj.column === 'status'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      onHeaderCell: () => onHeaderClick('status'),
      render: (status: string) => (
        <Badge
          textKey={status.charAt(0).toUpperCase() + status.slice(1)}
          color={getStatusColor(status)}
        />
      ),
    },
    {
      title: (
        <TitleWithSort
          title={t('table:table-item-created-date')}
          ascending={
            sortingObj.sort === SortOrder.Asc &&
            sortingObj.column === 'created_at'
          }
          isActive={sortingObj.column === 'created_at'}
        />
      ),
      className: 'cursor-pointer',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 150,
      onHeaderCell: () => onHeaderClick('created_at'),
      render: (created_at: string) =>
        dayjs().to(dayjs.utc(created_at).tz(dayjs.tz.guess())),
    },
    {
      title: t('table:table-item-actions'),
      dataIndex: 'id',
      key: 'actions',
      align: 'right',
      width: 200,
      render: (id: number, record: Prescription) => (
        <div className="flex items-center gap-3 justify-end">
          {record.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(id)}
                className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-accent rounded hover:bg-accent/90 transition-colors"
                title="Approve"
              >
                {t('common:text-approve')}
              </button>
              <button
                onClick={() => onReject(id)}
                className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                title="Reject"
              >
                {t('common:text-reject')}
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(id)}
            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-400 rounded hover:bg-red-500 transition-colors"
            title="Delete"
          >
            {t('common:text-delete')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6 overflow-hidden rounded shadow">
        <Table
          //@ts-ignore
          columns={columns}
          emptyText={() => (
            <div className="flex flex-col items-center py-7">
              <NoDataFound className="w-52" />
              <div className="pt-6 mb-1 text-base font-semibold text-heading">
                {t('table:empty-table-data')}
              </div>
              <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
            </div>
          )}
          data={prescriptions}
          rowKey="id"
          scroll={{ x: 1200 }}
          loading={loading}
        />
      </div>

      {!!pagination?.total && (
        <div className="flex items-center justify-end">
          <Pagination
            total={pagination.total}
            current={pagination.currentPage}
            pageSize={pagination.perPage}
            onChange={onPageChange}
          />
        </div>
      )}
    </>
  );
};
