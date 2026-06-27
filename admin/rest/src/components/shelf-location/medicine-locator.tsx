import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMedicineLocationSearchQuery } from '@/data/shelf-location';
import { ProductLocationResult } from '@/types';
import Loader from '@/components/ui/loader/loader';

interface Props {
  onLocate: (shelfLocationId: number | null) => void;
}

export default function MedicineLocator({ onLocate }: Props) {
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const { results, loading } = useMedicineLocationSearchQuery(debounced);

  return (
    <div>
      <div className="relative">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search a prescription medicine by name or SKU…"
          className="h-12 w-full rounded-lg border border-border-base bg-light px-4 text-sm text-heading focus:border-accent focus:outline-none focus:ring-0"
        />
        {loading ? (
          <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-body">
            Searching…
          </span>
        ) : null}
      </div>

      {debounced ? (
        <div className="mt-4">
          {loading && results.length === 0 ? (
            <Loader simple={true} className="h-8 w-8" />
          ) : results.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-body">
              No medicine matched “{debounced}”.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {results.map((item: ProductLocationResult) => (
                <li
                  key={item.product_id}
                  role="button"
                  onClick={() => onLocate(item.location?.shelf_location_id ?? null)}
                  className="flex items-start gap-3 rounded-lg border border-border-100 p-3 transition hover:border-accent hover:shadow-sm"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                    {item.image?.thumbnail ? (
                      <Image
                        src={item.image.thumbnail}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">
                      {item.name}
                    </p>
                    <p className="text-xs text-body">
                      SKU: {item.sku ?? '—'} · Qty: {item.quantity}
                    </p>
                    {item.location ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: item.location.color ?? '#6366f1' }}
                        >
                          {item.location.code}
                        </span>
                        <span className="text-xs text-heading">
                          {item.location.zone}
                          {item.location.bin ? ` · ${item.location.bin}` : ''}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-xs font-medium text-amber-600">
                        Not assigned to a shelf yet
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-body">
          Type a medicine name to see exactly which shelf and bin it is stored on.
        </p>
      )}
    </div>
  );
}
