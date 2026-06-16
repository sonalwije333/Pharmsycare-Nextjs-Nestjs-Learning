import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import client from '@/framework/client';
import {
  PrescriptionHistory,
  PrescriptionHistoryAction,
  PrescriptionStatus,
} from '@/types';

const ACTION_LABELS: Record<PrescriptionHistoryAction, string> = {
  [PrescriptionHistoryAction.UPLOADED]: 'Uploaded',
  [PrescriptionHistoryAction.APPROVED]: 'Approved',
  [PrescriptionHistoryAction.REJECTED]: 'Rejected',
  [PrescriptionHistoryAction.FULFILLED]: 'Fulfilled',
  [PrescriptionHistoryAction.EXPIRED]: 'Expired',
  [PrescriptionHistoryAction.STATUS_CHANGED]: 'Status changed',
  [PrescriptionHistoryAction.ASSIGNED_SHOP]: 'Assigned to shop',
  [PrescriptionHistoryAction.NOTES_UPDATED]: 'Notes updated',
};

const ACTION_COLORS: Record<PrescriptionHistoryAction, string> = {
  [PrescriptionHistoryAction.UPLOADED]: 'bg-blue-500',
  [PrescriptionHistoryAction.APPROVED]: 'bg-green-500',
  [PrescriptionHistoryAction.REJECTED]: 'bg-red-500',
  [PrescriptionHistoryAction.FULFILLED]: 'bg-indigo-500',
  [PrescriptionHistoryAction.EXPIRED]: 'bg-gray-400',
  [PrescriptionHistoryAction.STATUS_CHANGED]: 'bg-yellow-500',
  [PrescriptionHistoryAction.ASSIGNED_SHOP]: 'bg-purple-500',
  [PrescriptionHistoryAction.NOTES_UPDATED]: 'bg-orange-400',
};

function formatStatusChange(
  fromStatus: PrescriptionStatus | null,
  toStatus: PrescriptionStatus | null,
): string | null {
  if (!fromStatus && !toStatus) {
    return null;
  }

  if (fromStatus && toStatus && fromStatus !== toStatus) {
    return `${fromStatus} → ${toStatus}`;
  }

  return toStatus || fromStatus;
}

interface PrescriptionHistoryTimelineProps {
  prescriptionId: number;
}

export default function PrescriptionHistoryTimeline({
  prescriptionId,
}: PrescriptionHistoryTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<PrescriptionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setHistory([]);
    setIsOpen(false);
  }, [prescriptionId]);

  useEffect(() => {
    if (!isOpen || loaded) {
      return;
    }

    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await client.prescriptions.getHistory(prescriptionId);
        if (!cancelled) {
          setHistory(data);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load prescription history');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [isOpen, loaded, prescriptionId]);

  return (
    <div className="mt-4 border-t border-border-200 pt-3">
      <button
        type="button"
        className="text-sm font-semibold text-accent hover:underline"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? 'Hide history' : 'View history'}
      </button>

      {isOpen ? (
        <div className="mt-3">
          {loading ? (
            <p className="text-sm text-body">Loading history...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-body">No history recorded yet.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border-200 pl-4">
              {history.map((entry) => {
                const statusChange = formatStatusChange(
                  entry.from_status,
                  entry.to_status,
                );

                return (
                  <li key={entry.id} className="relative">
                    <span
                      className={`absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full ${
                        ACTION_COLORS[entry.action]
                      }`}
                    />
                    <p className="text-sm font-semibold text-heading">
                      {ACTION_LABELS[entry.action]}
                    </p>
                    <p className="text-xs text-body">
                      {dayjs(entry.created_at).format('MMM DD, YYYY h:mm A')}
                      {entry.performer_name ? ` · ${entry.performer_name}` : ''}
                    </p>
                    {statusChange ? (
                      <p className="mt-1 text-xs capitalize text-body">{statusChange}</p>
                    ) : null}
                    {entry.notes ? (
                      <p className="mt-1 text-sm text-body">{entry.notes}</p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      ) : null}
    </div>
  );
}
