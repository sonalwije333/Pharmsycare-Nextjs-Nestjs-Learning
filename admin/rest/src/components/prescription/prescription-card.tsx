import Image from 'next/image';
import dayjs from 'dayjs';
import Badge from '@/components/ui/badge/badge';
import Button from '@/components/ui/button';
import { Prescription, PrescriptionStatus } from '@/types';

const statusColor = {
  [PrescriptionStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PrescriptionStatus.APPROVED]: 'bg-green-100 text-green-800',
  [PrescriptionStatus.REJECTED]: 'bg-red-100 text-red-800',
  [PrescriptionStatus.FULFILLED]: 'bg-blue-100 text-blue-800',
  [PrescriptionStatus.EXPIRED]: 'bg-gray-100 text-gray-800',
};

interface PrescriptionCardProps {
  prescription: Prescription;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function PrescriptionCard({
  prescription,
  onApprove,
  onReject,
  onDelete,
}: PrescriptionCardProps) {
  return (
    <div className="rounded-lg border border-border-base bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex gap-4">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
          <Image
            src={prescription.image_url}
            alt={`Prescription ${prescription.id}`}
            fill
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-body">ID: #{prescription.id}</p>
              <p className="truncate font-medium text-heading">
                Customer: {prescription.customer_name} ({prescription.customer_email})
              </p>
              <p className="text-xs text-gray-500">
                Uploaded {dayjs(prescription.created_at).format('MMM DD, YYYY h:mm A')}
              </p>
              {prescription.shop_name ? (
                <p className="text-sm text-body">Shop: {prescription.shop_name}</p>
              ) : null}
            </div>
            <Badge
              text={prescription.status}
              className={statusColor[prescription.status]}
            />
          </div>

          {prescription.notes ? (
            <p className="mt-3 text-sm text-body">
              Notes: {prescription.notes}
            </p>
          ) : null}
          {prescription.admin_notes ? (
            <p className="mt-2 text-sm text-body">
              Admin notes: {prescription.admin_notes}
            </p>
          ) : null}
          {prescription.rejection_reason ? (
            <p className="mt-2 text-sm text-red-600">
              Rejection reason: {prescription.rejection_reason}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {prescription.processed_at ? (
              <span>
                Processed {dayjs(prescription.processed_at).format('MMM DD, YYYY h:mm A')}
              </span>
            ) : null}
            <span>
              Updated {dayjs(prescription.updated_at).format('MMM DD, YYYY h:mm A')}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {onApprove && prescription.status === PrescriptionStatus.PENDING ? (
              <Button
                variant="outline"
                size="small"
                onClick={() => onApprove(prescription.id)}
              >
                Approve
              </Button>
            ) : null}
            {onReject && prescription.status === PrescriptionStatus.PENDING ? (
              <Button
                variant="outline"
                size="small"
                onClick={() => onReject(prescription.id)}
              >
                Reject
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                variant="outline"
                size="small"
                onClick={() => onDelete(prescription.id)}
              >
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
