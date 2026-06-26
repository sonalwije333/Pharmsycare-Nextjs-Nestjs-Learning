import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  PrescriptionHistoryAction,
  PrescriptionHistoryEntry,
  PrescriptionStatus,
} from '@/types';
import { prescriptionService } from '@/data/prescription';

const ACTION_LABELS: Record<PrescriptionHistoryAction, string> = {
  [PrescriptionHistoryAction.CREATED]: 'Prescription uploaded',
  [PrescriptionHistoryAction.APPROVED]: 'Approved',
  [PrescriptionHistoryAction.REJECTED]: 'Rejected',
  [PrescriptionHistoryAction.STATUS_UPDATED]: 'Status updated',
  [PrescriptionHistoryAction.NOTES_UPDATED]: 'Notes updated',
  [PrescriptionHistoryAction.SHOP_ASSIGNED]: 'Assigned to shop',
};

const ACTION_DOT_CLASS: Record<PrescriptionHistoryAction, string> = {
  [PrescriptionHistoryAction.CREATED]: 'bg-blue-500',
  [PrescriptionHistoryAction.APPROVED]: 'bg-green-500',
  [PrescriptionHistoryAction.REJECTED]: 'bg-red-500',
  [PrescriptionHistoryAction.STATUS_UPDATED]: 'bg-purple-500',
  [PrescriptionHistoryAction.NOTES_UPDATED]: 'bg-gray-500',
  [PrescriptionHistoryAction.SHOP_ASSIGNED]: 'bg-orange-500',
};

function formatStatusChange(entry: PrescriptionHistoryEntry): string | null {
  if (entry.from_status && entry.from_status !== entry.to_status) {
    return `${entry.from_status} → ${entry.to_status}`;
  }

  if (!entry.from_status && entry.to_status === PrescriptionStatus.PENDING) {
    return `Status: ${entry.to_status}`;
  }

  return null;
}

interface PrescriptionHistoryTimelineProps {
  prescriptionId: number;
}

export default function PrescriptionHistoryTimeline({
  prescriptionId,
}: PrescriptionHistoryTimelineProps) {
  const [history, setHistory] = useState<PrescriptionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await prescriptionService.getHistory(prescriptionId);
        if (!cancelled) {
          setHistory(data);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load history');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [prescriptionId]);

  if (loading) {
    return <p className="text-sm text-body">Loading history...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (history.length === 0) {
    return <p className="text-sm text-body">No history recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-4 border-s border-border-base ps-4">
      {history.map((entry) => {
        const statusChange = formatStatusChange(entry);

        return (
          <li key={entry.id} className="relative">
            <span
              className={`absolute -start-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full ${ACTION_DOT_CLASS[entry.action]}`}
            />
            <div>
              <p className="text-sm font-medium text-heading">
                {ACTION_LABELS[entry.action]}
                {entry.performer_name ? (
                  <span className="font-normal text-body"> by {entry.performer_name}</span>
                ) : null}
              </p>
              <p className="text-xs text-gray-500">
                {dayjs(entry.created_at).format('MMM DD, YYYY h:mm A')}
              </p>
              {statusChange ? (
                <p className="mt-1 text-xs capitalize text-body">{statusChange}</p>
              ) : null}
              {entry.shop_id ? (
                <p className="mt-1 text-xs text-body">Shop ID: {entry.shop_id}</p>
              ) : null}
              {entry.notes ? (
                <p className="mt-1 text-sm text-body">{entry.notes}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
