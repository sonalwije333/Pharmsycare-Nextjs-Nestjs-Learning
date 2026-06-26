import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import client from '@/framework/client';
import { API_ENDPOINTS } from '@/framework/client/api-endpoints';
import { PrescriptionMedicine } from '@/types';
import Spinner from '@/components/ui/loaders/spinner/spinner';

interface MedicinePickerProps {
  value: PrescriptionMedicine[];
  onChange: (medicines: PrescriptionMedicine[]) => void;
}

function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const MedicinePicker: React.FC<MedicinePickerProps> = ({ value, onChange }) => {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term);

  const { data, isLoading } = useQuery(
    [API_ENDPOINTS.PRODUCTS, 'prescription-picker', debouncedTerm],
    () => client.products.all({ name: debouncedTerm, limit: 6 } as any),
    { enabled: debouncedTerm.trim().length > 1, keepPreviousData: true },
  );

  const results = (data as any)?.data ?? [];

  const addMedicine = (product: any) => {
    if (value.some((m) => m.product_id === product.id)) return;
    onChange([
      ...value,
      {
        product_id: product.id,
        name: product.name,
        quantity: 1,
        price: product.sale_price ?? product.price ?? undefined,
        image: product.image?.original ?? product.image?.thumbnail ?? undefined,
      },
    ]);
  };

  const updateQty = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    onChange(
      value.map((m) =>
        m.product_id === productId ? { ...m, quantity } : m,
      ),
    );
  };

  const removeMedicine = (productId: number) => {
    onChange(value.filter((m) => m.product_id !== productId));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-heading">
        Medicines (optional)
      </label>
      <p className="mb-3 text-xs text-body">
        Search and add the medicines listed on your prescription so our pharmacy
        can prepare them faster.
      </p>

      <div className="relative">
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search medicines by name"
          className="block w-full rounded border border-border-200 p-3 text-sm focus:border-accent focus:outline-none"
        />
        {(isLoading || (debouncedTerm.length > 1 && results.length > 0)) && (
          <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded border border-border-200 bg-light shadow-lg">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Spinner simple className="h-5 w-5" />
              </div>
            ) : (
              results.map((product: any) => (
                <button
                  type="button"
                  key={product.id}
                  onClick={() => addMedicine(product)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-gray-100"
                  disabled={value.some((m) => m.product_id === product.id)}
                >
                  {product.image?.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image.thumbnail}
                      alt={product.name}
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <span className="h-8 w-8 rounded bg-gray-100" />
                  )}
                  <span className="flex-1 text-heading">{product.name}</span>
                  {value.some((m) => m.product_id === product.id) ? (
                    <span className="text-xs text-accent">Added</span>
                  ) : (
                    <span className="text-xs text-body">+ Add</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {value.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {value.map((m) => (
            <li
              key={m.product_id}
              className="flex items-center gap-3 rounded border border-border-200 bg-gray-50 p-2.5"
            >
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.image}
                  alt={m.name}
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <span className="h-10 w-10 rounded bg-gray-200" />
              )}
              <span className="flex-1 text-sm text-heading">{m.name}</span>
              <div className="flex items-center rounded border border-border-200">
                <button
                  type="button"
                  className="px-2.5 py-1 text-heading"
                  onClick={() => updateQty(m.product_id, m.quantity - 1)}
                >
                  -
                </button>
                <span className="w-8 text-center text-sm">{m.quantity}</span>
                <button
                  type="button"
                  className="px-2.5 py-1 text-heading"
                  onClick={() => updateQty(m.product_id, m.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-red-500"
                onClick={() => removeMedicine(m.product_id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default MedicinePicker;
