import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { userClient } from '@/data/client/user';
import cn from 'classnames';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import { PosCustomer } from './pos-types';

export interface CustomerSelectHandle {
  open: () => void;
}

interface CustomerSelectProps {
  customer: PosCustomer | null;
  onChange: (customer: PosCustomer | null) => void;
}

const CustomerSelect = forwardRef<CustomerSelectHandle, CustomerSelectProps>(
  ({ customer, onChange }, ref) => {
    const [open, setOpen] = useState(false);
    const [term, setTerm] = useState('');
    const [debounced, setDebounced] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));

    useEffect(() => {
      const timer = setTimeout(() => setDebounced(term), 300);
      return () => clearTimeout(timer);
    }, [term]);

    useEffect(() => {
      if (open) {
        setTimeout(() => inputRef.current?.focus(), 10);
      }
    }, [open]);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { data, isLoading } = useQuery(
      [API_ENDPOINTS.USERS, { name: debounced, page: 1 }],
      () => userClient.fetchUsers({ name: debounced, page: 1 }),
      { enabled: open, keepPreviousData: true },
    );

    const results = (data as any)?.data ?? [];

    const select = (next: PosCustomer | null) => {
      onChange(next);
      setOpen(false);
      setTerm('');
    };

    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-lg border border-border-200 bg-white px-3 py-2.5 text-left text-sm transition hover:border-accent focus:border-accent focus:outline-none"
        >
          <span className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-muted">
              Customer
            </span>
            <span className="font-medium text-heading">
              {customer?.name ?? 'Walk in Customer'}
            </span>
          </span>
          <span className="text-xs font-medium text-accent">Change</span>
        </button>

        {open ? (
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border-200 bg-white shadow-lg">
            <div className="border-b border-border-200 p-2">
              <input
                ref={inputRef}
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.stopPropagation();
                    setOpen(false);
                  }
                }}
                placeholder="Search name / email…"
                className="block w-full rounded-md border border-border-200 bg-gray-50 px-3 py-2 text-sm text-heading focus:border-accent focus:bg-white focus:outline-none"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto py-1 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => select(null)}
                  className={cn(
                    'flex w-full items-center px-3 py-2 text-left hover:bg-gray-50',
                    !customer && 'text-accent',
                  )}
                >
                  Walk in Customer
                </button>
              </li>
              {isLoading ? (
                <li className="px-3 py-2 text-muted">Searching…</li>
              ) : null}
              {!isLoading && results.length === 0 && debounced ? (
                <li className="px-3 py-2 text-muted">No customers found</li>
              ) : null}
              {results.map((user: any) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() =>
                      select({
                        id: Number(user.id),
                        name: user.name,
                        email: user.email,
                      })
                    }
                    className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-heading">
                      {user.name}
                    </span>
                    {user.email ? (
                      <span className="text-xs text-muted">{user.email}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  },
);

CustomerSelect.displayName = 'CustomerSelect';

export default CustomerSelect;
