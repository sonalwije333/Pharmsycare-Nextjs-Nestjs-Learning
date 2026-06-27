import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Loader from '@/components/ui/loader/loader';
import Badge from '@/components/ui/badge/badge';
import {
  useBranchAvailabilityQuery,
  useBranchQuery,
  useDeleteBranchMutation,
  useRemoveBranchInventoryMutation,
  useUpsertBranchInventoryMutation,
} from '@/data/branch';
import { BranchInventoryItem } from '@/types';

interface Props {
  branchId: number;
  onDeleted: () => void;
}

function AddProduct({ branchId }: { branchId: number }) {
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [quantity, setQuantity] = useState('20');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const { results, loading } = useBranchAvailabilityQuery(
    selected ? '' : debounced,
  );
  const { mutate: upsert, isLoading: saving } =
    useUpsertBranchInventoryMutation();

  const handleAdd = () => {
    if (!selected) return;
    upsert(
      {
        id: branchId,
        input: { product_id: selected.id, quantity: Number(quantity) || 0 },
      },
      {
        onSuccess: () => {
          setSelected(null);
          setText('');
          setDebounced('');
          setQuantity('20');
        },
      },
    );
  };

  return (
    <div className="rounded-lg border border-dashed border-border-200 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-body">
        Add / update stock
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
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            className="h-10 w-full rounded border border-border-base px-3 text-sm focus:border-accent focus:outline-none"
          />
          <Button
            size="small"
            className="w-full"
            loading={saving}
            onClick={handleAdd}
          >
            Save stock
          </Button>
        </div>
      ) : (
        <>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search medicine to stock…"
            className="h-10 w-full rounded border border-border-base px-3 text-sm focus:border-accent focus:outline-none"
          />
          {debounced ? (
            <div className="mt-2 max-h-44 overflow-y-auto">
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
                        onClick={() =>
                          setSelected({ id: item.product_id, name: item.name })
                        }
                        className="w-full truncate rounded px-2 py-1.5 text-left text-sm text-heading hover:bg-gray-50"
                      >
                        {item.name}
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

function InventoryRow({
  branchId,
  item,
}: {
  branchId: number;
  item: BranchInventoryItem;
}) {
  const [qty, setQty] = useState(String(item.quantity));
  const { mutate: upsert, isLoading: saving } =
    useUpsertBranchInventoryMutation();
  const { mutate: remove } = useRemoveBranchInventoryMutation();

  const dirty = String(item.quantity) !== qty;
  const low = item.quantity <= item.reorder_level;

  return (
    <li className="flex items-center gap-2 rounded border border-border-100 p-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-heading">
          {item.product_name ?? `#${item.product_id}`}
        </p>
        <p className="text-xs text-body">
          {item.product_sku ?? '—'}
          {low ? (
            <Badge text="Low" className="ms-2 bg-red-100 text-red-700" />
          ) : null}
        </p>
      </div>
      <input
        type="number"
        min={0}
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="h-9 w-20 rounded border border-border-base px-2 text-sm focus:border-accent focus:outline-none"
      />
      <Button
        size="small"
        variant="outline"
        loading={saving}
        disabled={!dirty}
        onClick={() =>
          upsert({
            id: branchId,
            input: { product_id: item.product_id, quantity: Number(qty) || 0 },
          })
        }
      >
        Save
      </Button>
      <button
        type="button"
        className="text-xs text-red-500 hover:underline"
        onClick={() => remove({ id: branchId, productId: item.product_id })}
      >
        Remove
      </button>
    </li>
  );
}

export default function BranchDetail({ branchId, onDeleted }: Props) {
  const { branch, loading } = useBranchQuery(branchId);
  const { mutate: deleteBranch, isLoading: deleting } =
    useDeleteBranchMutation();

  if (loading && !branch) {
    return <Loader simple={true} className="mx-auto my-8 h-8 w-8" />;
  }
  if (!branch) return null;

  const inventory = branch.inventory ?? [];

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-heading">{branch.name}</h3>
          {branch.is_main ? (
            <Badge text="Main" className="bg-accent/10 text-accent" />
          ) : null}
        </div>
        <p className="text-xs text-body">
          {branch.code} · {branch.city}
          {branch.manager_name ? ` · ${branch.manager_name}` : ''}
        </p>
        {branch.phone ? (
          <p className="text-xs text-body">{branch.phone}</p>
        ) : null}
        <p className="mt-1 text-xs text-body">
          Vendor:{' '}
          {branch.vendor ? (
            <span className="font-medium text-heading">
              {branch.vendor.name}{' '}
              <span className="text-body">({branch.vendor.email})</span>
            </span>
          ) : (
            <span className="text-amber-600">Not connected</span>
          )}
        </p>
      </div>

      <AddProduct branchId={branchId} />

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-body">
          Stocked products ({inventory.length})
        </p>
        {inventory.length === 0 ? (
          <p className="rounded bg-gray-50 p-4 text-center text-xs text-body">
            No products stocked at this branch yet.
          </p>
        ) : (
          <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {inventory.map((item) => (
              <InventoryRow key={item.id} branchId={branchId} item={item} />
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
            if (window.confirm(`Delete branch "${branch.name}"?`)) {
              deleteBranch(branch.id, { onSuccess: onDeleted });
            }
          }}
        >
          Delete branch
        </Button>
      </div>
    </div>
  );
}
