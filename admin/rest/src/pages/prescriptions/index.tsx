import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { toast } from 'react-toastify';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Search from '@/components/common/search';
import AdminLayout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import LinkButton from '@/components/ui/link-button';
import Select from '@/components/ui/select/select';
import Pagination from '@/components/ui/pagination';
import Modal from '@/components/ui/modal/modal';
import TextArea from '@/components/ui/text-area';
import PrescriptionCard from '@/components/prescription/prescription-card';
import { NoDataFound } from '@/components/icons/no-data-found';
import { prescriptionService } from '@/data/prescription';
import { Prescription, PrescriptionStatus } from '@/types';
import { Routes } from '@/config/routes';
import { adminOwnerAndStaffOnly, getAuthCredentials } from '@/utils/auth-utils';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: PrescriptionStatus.PENDING, label: 'Pending' },
  { value: PrescriptionStatus.APPROVED, label: 'Approved' },
  { value: PrescriptionStatus.REJECTED, label: 'Rejected' },
  { value: PrescriptionStatus.FULFILLED, label: 'Fulfilled' },
  { value: PrescriptionStatus.EXPIRED, label: 'Expired' },
];

export default function PrescriptionsPage() {
  const router = useRouter();
  const { token } = getAuthCredentials();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const selectedStatus =
    statusOptions.find((option) => option.value === status) ?? null;

  const fetchPrescriptions = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await prescriptionService.getAll({
        page,
        limit,
        status: status ? (status as PrescriptionStatus) : undefined,
        search: search.trim() || undefined,
      });
      setPrescriptions(response.data);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [token, page, status, search]);

  const handleApprove = async (id: number) => {
    try {
      await prescriptionService.approve(id);
      toast.success('Prescription approved');
      await fetchPrescriptions();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleFulfill = async (id: number) => {
    try {
      await prescriptionService.fulfill(id);
      toast.success('Prescription marked as fulfilled');
      await fetchPrescriptions();
    } catch (error) {
      toast.error('Fulfillment failed');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.id || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await prescriptionService.reject(rejectModal.id, rejectReason.trim());
      toast.success('Prescription rejected');
      setRejectModal({ open: false, id: null });
      setRejectReason('');
      await fetchPrescriptions();
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this prescription? This action cannot be undone.',
    );
    if (!confirmed) {
      return;
    }

    try {
      await prescriptionService.delete(id);
      toast.success('Prescription deleted');
      await fetchPrescriptions();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div>
      <Card className="mb-8 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="md:w-1/3">
          <PageHeading title="Prescriptions" />
          <p className="mt-2 text-sm text-body">
            Review uploaded prescriptions and process approvals.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 md:ms-auto md:w-2/3 xl:w-3/5">
          <Search
            onSearch={({ searchText }) => {
              setPage(1);
              setSearch(searchText);
            }}
            placeholderText="Search by customer name or email"
            inputClassName="bg-light"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              options={statusOptions}
              value={selectedStatus}
              onChange={(option: any) => {
                setPage(1);
                setStatus(option?.value ?? '');
              }}
              isClearable
              placeholder="All Status"
              className="sm:min-w-[180px]"
            />
            <LinkButton
              href={Routes.prescriptions.create}
              className="w-full sm:ms-auto sm:w-auto md:h-12"
            >
              <span>+ Create Prescription</span>
            </LinkButton>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        {loading ? (
          <div className="py-12 text-center text-body">Loading...</div>
        ) : prescriptions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <NoDataFound className="w-52" />
            <div className="mb-1 pt-6 text-base font-semibold text-heading">
              No prescriptions found
            </div>
            <p className="text-[13px] text-body">
              Try another search or status filter, or create a new prescription.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onApprove={handleApprove}
                onReject={(id) => setRejectModal({ open: true, id })}
                onFulfill={handleFulfill}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {total > limit ? (
          <div className="flex justify-center pt-6">
            <Pagination
              total={total}
              pageSize={limit}
              current={page}
              onChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <Modal
        open={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: null })}
        title="Reject Prescription"
      >
        <div className="space-y-4">
          <TextArea
            name="reject-reason"
            label="Reason for rejection"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Enter rejection reason"
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="small"
              onClick={() => setRejectModal({ open: false, id: null })}
            >
              Cancel
            </Button>
            <Button size="small" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

PrescriptionsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
PrescriptionsPage.Layout = AdminLayout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
});
