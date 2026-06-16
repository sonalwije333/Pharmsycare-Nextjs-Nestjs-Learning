import DashboardLayout from '@/layouts/_dashboard';
import Card from '@/components/ui/cards/card';
import Button from '@/components/ui/button';
import Link from '@/components/ui/link';
import ErrorMessage from '@/components/ui/error-message';
import NotFound from '@/components/ui/not-found';
import Pagination from '@/components/ui/pagination';
import Spinner from '@/components/ui/loaders/spinner/spinner';
import { Routes } from '@/config/routes';
import client from '@/framework/client';
import { API_ENDPOINTS } from '@/framework/client/api-endpoints';
import { useUser } from '@/framework/user';
import { Prescription, PrescriptionStatus } from '@/types';
import { useState } from 'react';
import { useQuery } from 'react-query';
import dayjs from 'dayjs';
import PrescriptionHistoryTimeline from '@/components/prescription/prescription-history-timeline';

export { getStaticProps } from '@/framework/general.ssr';

const STATUS_OPTIONS: Array<{ value: '' | PrescriptionStatus; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: PrescriptionStatus.PENDING, label: 'Pending' },
  { value: PrescriptionStatus.APPROVED, label: 'Approved' },
  { value: PrescriptionStatus.REJECTED, label: 'Rejected' },
  { value: PrescriptionStatus.FULFILLED, label: 'Fulfilled' },
  { value: PrescriptionStatus.EXPIRED, label: 'Expired' },
];

const STATUS_BADGE_CLASS: Record<PrescriptionStatus, string> = {
  [PrescriptionStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PrescriptionStatus.APPROVED]: 'bg-green-100 text-green-800',
  [PrescriptionStatus.REJECTED]: 'bg-red-100 text-red-800',
  [PrescriptionStatus.FULFILLED]: 'bg-blue-100 text-blue-800',
  [PrescriptionStatus.EXPIRED]: 'bg-gray-100 text-gray-800',
};

function getProgressMessage(prescription: Prescription): string {
  if (prescription.status === PrescriptionStatus.PENDING) {
    return 'Waiting for pharmacist review.';
  }

  if (prescription.status === PrescriptionStatus.APPROVED) {
    return 'Approved. Your order can now be fulfilled.';
  }

  if (prescription.status === PrescriptionStatus.REJECTED) {
    return prescription.rejection_reason
      ? `Rejected: ${prescription.rejection_reason}`
      : 'Rejected by pharmacy staff.';
  }

  if (prescription.status === PrescriptionStatus.FULFILLED) {
    return 'Fulfilled successfully.';
  }

  return 'Expired. Please upload a new prescription.';
}

export default function MyPrescriptionsPage() {
  const { isAuthorized, isLoading: userLoading } = useUser();
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [status, setStatus] = useState<'' | PrescriptionStatus>('');

  const { data, isLoading, isFetching, error } = useQuery(
    [API_ENDPOINTS.PRESCRIPTIONS_MY, page, limit, status],
    () =>
      client.prescriptions.getMy({
        page,
        limit,
        status: status || undefined,
      }),
    {
      enabled: isAuthorized && !userLoading,
      keepPreviousData: true,
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
    },
  );

  if (error) {
    return <ErrorMessage message={(error as Error).message} />;
  }

  const prescriptions = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Card className="w-full shadow-none sm:shadow">
      <div className="mb-8 flex flex-col gap-4 border-b border-dashed border-border-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading sm:text-xl">My Prescriptions</h1>
          <p className="mt-2 text-sm text-body">
            Upload prescriptions and track your progress updates from pharmacy staff.
          </p>
        </div>

        <Link
          href={Routes.uploadPrescription}
          className="inline-flex h-11 items-center justify-center rounded bg-accent px-5 text-sm font-semibold text-light transition hover:bg-accent-hover"
        >
          Upload Prescription
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-body">
          <span>Status:</span>
          <select
            className="h-10 rounded border border-border-200 px-3 text-sm focus:border-accent focus:outline-none"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as '' | PrescriptionStatus);
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading || userLoading ? (
        <div className="my-12 flex items-center justify-center">
          <Spinner simple className="h-8 w-8" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="my-12 flex items-center justify-center">
          <NotFound text="No prescriptions found" />
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="rounded border border-border-200 bg-light p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-28 w-full overflow-hidden rounded border border-border-200 bg-gray-50 sm:h-24 sm:w-32">
                  <img
                    src={prescription.image_url}
                    alt={`Prescription ${prescription.id}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold text-heading">Prescription #{prescription.id}</p>
                    <span
                      className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold capitalize ${
                        STATUS_BADGE_CLASS[prescription.status]
                      }`}
                    >
                      {prescription.status}
                    </span>
                  </div>

                  <p className="text-xs text-body">
                    Uploaded {dayjs(prescription.created_at).format('MMM DD, YYYY h:mm A')}
                  </p>

                  <p className="mt-2 text-sm text-heading">{getProgressMessage(prescription)}</p>

                  {prescription.notes ? (
                    <p className="mt-2 text-sm text-body">Your notes: {prescription.notes}</p>
                  ) : null}

                  {prescription.admin_notes ? (
                    <p className="mt-2 text-sm text-body">Pharmacy notes: {prescription.admin_notes}</p>
                  ) : null}

                  {prescription.processed_at ? (
                    <p className="mt-2 text-xs text-body">
                      Last updated {dayjs(prescription.processed_at).format('MMM DD, YYYY h:mm A')}
                    </p>
                  ) : null}

                  <PrescriptionHistoryTimeline prescriptionId={prescription.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFetching && !isLoading ? (
        <div className="mt-4 text-center text-xs text-body">Refreshing...</div>
      ) : null}

      {total > limit ? (
        <div className="mt-8 flex justify-center">
          <Pagination
            total={total}
            pageSize={limit}
            current={page}
            onChange={(nextPage) => setPage(nextPage)}
          />
        </div>
      ) : null}

      <div className="mt-8 border-t border-dashed border-border-200 pt-5">
        <Button onClick={() => (window.location.href = Routes.uploadPrescription)}>
          Upload New Prescription
        </Button>
      </div>
    </Card>
  );
}

MyPrescriptionsPage.authenticationRequired = true;
MyPrescriptionsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
