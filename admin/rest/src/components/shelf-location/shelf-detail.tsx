import { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/button';
import Loader from '@/components/ui/loader/loader';
import {
  useAssignShelfProductMutation,
  useDeleteShelfLocationMutation,
  useMedicineLocationSearchQuery,
  useShelfWithProductsQuery,
  useUnassignShelfProductMutation,
} from '@/data/shelf-location';
import { ProductLocationResult } from '@/types';

interface Props {
  shelfId: number;
  onDeleted: () => void;
}

function AssignProduct({ shelfId }: { shelfId: number }) {
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selected, setSelected] = useState<ProductLocationResult | null>(null);
  const [bin, setBin] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const { results, loading } = useMedicineLocationSearchQuery(
    selected ? '' : debounced,
  );
  const { mutate: assign, isLoading: assigning } =
    useAssignShelfProductMutation();

  const handleAssign = () => {
    if (!selected) return;
    assign(
      {
        id: shelfId,
        input: { product_id: selected.product_id, bin: bin || undefined },
      },
      {
        onSuccess: () => {
          setSelected(null);
          setText('');
          setDebounced('');
          setBin('');
        },
      },
    );
  };

  return (
    <div className="rounded-lg border border-dashed border-border-200 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-body">
        Place a medicine here
      </p>

      {selected ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded bg-gray-50 p-2">
            <span className="truncate text-sm font-medium text-heading">
              {selected.name}
            </span>
            <button
              type="button"
              className="text-xs text-accent hover:underline"
              onClick={() => setSelected(null)}
            >
              Change
            </button>
          </div>
          <input
            value={bin}
            onChange={(e) => setBin(e.target.value)}
            placeholder="Bin / sub-position (optional)"
            className="h-10 w-full rounded border border-border-base px-3 text-sm focus:border-accent focus:outline-none"
          />
          {selected.location ? (
            <p className="text-xs text-amber-600">
              Currently on {selected.location.code}. Assigning will move it here.
            </p>
          ) : null}
          <Button
            size="small"
            className="w-full"
            loading={assigning}
            onClick={handleAssign}
          >
            Assign to shelf
          </Button>
        </div>
      ) : (
        <>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search medicine to add…"
            className="h-10 w-full rounded border border-border-base px-3 text-sm focus:border-accent focus:outline-none"
          />
          {debounced ? (
            <div className="mt-2 max-h-48 overflow-y-auto">
              {loading ? (
                <p className="p-2 text-xs text-body">Searching…</p>
              ) : results.length === 0 ? (
                <p className="p-2 text-xs text-body">No matches.</p>
              ) : (
                <ul className="space-y-1">
                  {results.map((item) => (
                    <li key={item.product_id}>
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                      >
                        <span className="truncate text-heading">
                          {item.name}
                        </span>
                        {item.location ? (
                          <span
                            className="ms-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{
                              backgroundColor: item.location.color ?? '#6366f1',
                            }}
                          >
                            {item.location.code}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function ShelfDetail({ shelfId, onDeleted }: Props) {
  const { shelf, products, loading } = useShelfWithProductsQuery(shelfId);
  const { mutate: unassign } = useUnassignShelfProductMutation();
  const { mutate: deleteShelf, isLoading: deleting } =
    useDeleteShelfLocationMutation();

  if (loading && !shelf) {
    return <Loader simple={true} className="mx-auto my-8 h-8 w-8" />;
  }

  if (!shelf) {
    return null;
  }

  const color = shelf.color ?? '#6366f1';

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {shelf.code}
          </span>
          <div>
            <h3 className="text-base font-semibold text-heading">
              {shelf.name}
            </h3>
            <p className="text-xs text-body">
              {shelf.zone}
              {shelf.aisle ? ` · ${shelf.aisle}` : ''}
            </p>
          </div>
        </div>
      </div>

      <AssignProduct shelfId={shelfId} />

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-body">
          Products on this shelf ({products.length})
        </p>
        {products.length === 0 ? (
          <p className="rounded bg-gray-50 p-4 text-center text-xs text-body">
            No products placed here yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {products.map((item) => (
              <li
                key={item.product_id}
                className="flex items-center gap-3 rounded border border-border-100 p-2"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  {item.image?.thumbnail ? (
                    <Image
                      src={item.image.thumbnail}
                      alt={item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">
                    {item.name}
                  </p>
                  <p className="text-xs text-body">
                    {item.location?.bin ? `${item.location.bin} · ` : ''}
                    Qty: {item.quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => unassign(item.product_id)}
                  className="shrink-0 text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t pt-3">
        <Button
          variant="outline"
          size="small"
          loading={deleting}
          className="w-full !border-red-200 !text-red-500 hover:!bg-red-500 hover:!text-light"
          onClick={() => {
            if (
              window.confirm(
                `Delete shelf "${shelf.code}"? Products on it will be unassigned.`,
              )
            ) {
              deleteShelf(shelf.id, { onSuccess: onDeleted });
            }
          }}
        >
          Delete shelf
        </Button>
      </div>
    </div>
  );
}
