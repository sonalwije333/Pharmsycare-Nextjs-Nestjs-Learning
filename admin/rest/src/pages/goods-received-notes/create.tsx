import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import { TrashIcon } from '@/components/icons/trash';
import { Routes } from '@/config/routes';
import { useProductsQuery } from '@/data/product';
import { useSupplierProfilesQuery } from '@/data/supplier';
import { useCreateGrnMutation } from '@/data/grn';
import { GrnStatus, Product, ProductStatus } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

interface GrnLine {
  product_id: number;
  product_name: string;
  sku: string | null;
  ordered_quantity: number;
  received_quantity: number;
  unit_cost: number;
}

function formatRs(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString('en-LK')}`;
}

export default function CreateGrnPage() {
  const { locale } = useRouter();
  const [supplierId, setSupplierId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<GrnLine[]>([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { profiles, loading: suppliersLoading } = useSupplierProfilesQuery({
    limit: 200,
  });
  const { mutate: createGrn, isLoading: saving } = useCreateGrnMutation();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { products } = useProductsQuery(
    {
      language: locale,
      status: ProductStatus.Publish,
      name: debounced,
      limit: 8,
    },
    { enabled: showResults && debounced.length > 0 },
  );

  function addProduct(product: Product) {
    const id = Number(product.id);
    setItems((current) => {
      const existing = current.find((line) => line.product_id === id);
      if (existing) {
        return current.map((line) =>
          line.product_id === id
            ? { ...line, received_quantity: line.received_quantity + 1 }
            : line,
        );
      }
      return [
        ...current,
        {
          product_id: id,
          product_name: product.name,
          sku: product.sku ?? null,
          ordered_quantity: 0,
          received_quantity: 1,
          unit_cost: Number(product.sale_price ?? product.price ?? 0),
        },
      ];
    });
    setSearch('');
    setShowResults(false);
  }

  function updateLine(id: number, patch: Partial<GrnLine>) {
    setItems((current) =>
      current.map((line) =>
        line.product_id === id ? { ...line, ...patch } : line,
      ),
    );
  }

  function removeLine(id: number) {
    setItems((current) => current.filter((line) => line.product_id !== id));
  }

  const totals = useMemo(() => {
    const quantity = items.reduce(
      (sum, line) => sum + Number(line.received_quantity || 0),
      0,
    );
    const cost = items.reduce(
      (sum, line) =>
        sum + Number(line.unit_cost || 0) * Number(line.received_quantity || 0),
      0,
    );
    return { quantity, cost: Number(cost.toFixed(2)) };
  }, [items]);

  function submit(status: GrnStatus) {
    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }
    if (items.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    if (items.some((line) => Number(line.received_quantity) < 1)) {
      toast.error('Received quantity must be at least 1 for every item');
      return;
    }
    createGrn({
      supplier_id: Number(supplierId),
      invoice_number: invoiceNumber || undefined,
      notes: notes || undefined,
      status,
      items: items.map((line) => ({
        product_id: line.product_id,
        ordered_quantity: line.ordered_quantity || undefined,
        received_quantity: Number(line.received_quantity),
        unit_cost: Number(line.unit_cost),
      })),
    });
  }

  return (
    <>
      <Card className="mb-8 flex flex-col gap-2">
        <PageHeading title="Create Goods Received Note" />
        <p className="text-sm text-body">
          Record items physically received from a supplier. Saving and
          receiving will increase product stock and log procurement history.
        </p>
      </Card>

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-body">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="h-12 w-full rounded border border-border-base px-4 text-sm text-heading focus:border-accent focus:outline-none"
            >
              <option value="">
                {suppliersLoading ? 'Loading…' : 'Select supplier'}
              </option>
              {profiles.map((profile: any) => (
                <option key={profile.id} value={profile.id}>
                  {profile.company_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-body">
              Invoice / Reference No.
            </label>
            <input
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
              placeholder="e.g. INV-00123"
              className="h-12 w-full rounded border border-border-base px-4 text-sm text-heading focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-body">
              Notes
            </label>
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional remarks"
              className="h-12 w-full rounded border border-border-base px-4 text-sm text-heading focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="relative mb-5 max-w-lg">
          <label className="mb-1 block text-sm font-medium text-body">
            Add products
          </label>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search product by name…"
            className="h-12 w-full rounded border border-border-base px-4 text-sm text-heading focus:border-accent focus:outline-none"
          />
          {showResults && debounced.length > 0 ? (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border-200 bg-white shadow-lg">
              <ul className="max-h-72 overflow-y-auto py-1 text-sm">
                {products.length === 0 ? (
                  <li className="px-4 py-2 text-body">No products found</li>
                ) : (
                  products.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => addProduct(product)}
                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-gray-50"
                      >
                        <span className="text-heading">{product.name}</span>
                        <span className="text-xs text-body">
                          {formatRs(
                            Number(product.sale_price ?? product.price ?? 0),
                          )}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-body">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 w-28">Ordered</th>
                <th className="px-4 py-3 w-28">Received</th>
                <th className="px-4 py-3 w-36">Unit Cost</th>
                <th className="px-4 py-3 w-32">Line Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((line) => (
                <tr key={line.product_id} className="border-b border-dashed">
                  <td className="px-4 py-3">
                    <p className="font-medium text-heading">
                      {line.product_name}
                    </p>
                    <p className="text-xs text-body">SKU: {line.sku ?? '-'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={line.ordered_quantity || ''}
                      onChange={(event) =>
                        updateLine(line.product_id, {
                          ordered_quantity: Number(event.target.value),
                        })
                      }
                      className="h-9 w-full rounded border border-border-200 px-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={1}
                      value={line.received_quantity}
                      onChange={(event) =>
                        updateLine(line.product_id, {
                          received_quantity: Number(event.target.value),
                        })
                      }
                      className="h-9 w-full rounded border border-border-200 px-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unit_cost}
                      onChange={(event) =>
                        updateLine(line.product_id, {
                          unit_cost: Number(event.target.value),
                        })
                      }
                      className="h-9 w-full rounded border border-border-200 px-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-heading">
                    {formatRs(line.unit_cost * line.received_quantity)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeLine(line.product_id)}
                      className="text-body hover:text-red-500"
                      aria-label="Remove"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-body">
              No products added yet. Use the search above to add items.
            </p>
          ) : null}
        </div>

        {items.length > 0 ? (
          <div className="mt-4 flex justify-end gap-8 border-t border-border-200 pt-4 text-sm">
            <div>
              <span className="text-body">Total Units: </span>
              <span className="font-semibold text-heading">
                {totals.quantity}
              </span>
            </div>
            <div>
              <span className="text-body">Total Cost: </span>
              <span className="font-semibold text-accent">
                {formatRs(totals.cost)}
              </span>
            </div>
          </div>
        ) : null}
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          disabled={saving}
          onClick={() => submit(GrnStatus.DRAFT)}
        >
          Save as Draft
        </Button>
        <Button
          loading={saving}
          disabled={saving}
          onClick={() => submit(GrnStatus.RECEIVED)}
        >
          Save &amp; Receive (update stock)
        </Button>
      </div>
    </>
  );
}

CreateGrnPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
CreateGrnPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
