import { useEffect, useState } from 'react';
import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import MedicineLocator from '@/components/shelf-location/medicine-locator';
import ShelfMap from '@/components/shelf-location/shelf-map';
import ShelfForm from '@/components/shelf-location/shelf-form';
import ShelfDetail from '@/components/shelf-location/shelf-detail';
import { useShelfLayoutQuery } from '@/data/shelf-location';
import { ShelfLocation } from '@/types';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border-100 px-4 py-3">
      <p className="text-2xl font-bold text-heading">{value}</p>
      <p className="text-xs text-body">{label}</p>
    </div>
  );
}

export default function ShelfLocationsPage() {
  const { t } = useTranslation();
  const {
    zones,
    totalShelves,
    totalAssignedProducts,
    loading,
    error,
  } = useShelfLayoutQuery();

  const [selectedShelfId, setSelectedShelfId] = useState<number | null>(null);
  const [highlightedShelfId, setHighlightedShelfId] = useState<number | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (highlightedShelfId == null) return;
    const timer = setTimeout(() => setHighlightedShelfId(null), 3500);
    return () => clearTimeout(timer);
  }, [highlightedShelfId]);

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const handleLocate = (shelfId: number | null) => {
    if (!shelfId) return;
    setHighlightedShelfId(shelfId);
    setSelectedShelfId(shelfId);
  };

  return (
    <>
      <Card className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <PageHeading title="Shelf Location Mapping" />
            <p className="mt-2 text-sm text-body">
              Map medicines to physical shelves, then instantly locate any
              prescription item on the pharmacy floor.
            </p>
          </div>
          <Button onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? 'Close' : 'Add Shelf'}
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:max-w-md">
          <StatCard label="Zones" value={zones.length} />
          <StatCard label="Shelves" value={totalShelves} />
          <StatCard label="Mapped products" value={totalAssignedProducts} />
        </div>

        {showForm ? (
          <div className="mt-6 rounded-lg bg-gray-50 p-5">
            <h3 className="mb-4 text-sm font-bold text-heading">
              New Shelf Location
            </h3>
            <ShelfForm onClose={() => setShowForm(false)} />
          </div>
        ) : null}
      </Card>

      <Card className="mb-8">
        <h2 className="mb-1 text-base font-semibold text-heading">
          Medicine Location Search
        </h2>
        <p className="mb-4 text-sm text-body">
          Search a prescription item to see its shelf, zone and bin. Click a
          result to highlight it on the map below.
        </p>
        <MedicineLocator onLocate={handleLocate} />
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-heading">
            Pharmacy Floor Map
          </h2>
          <ShelfMap
            zones={zones}
            selectedShelfId={selectedShelfId}
            highlightedShelfId={highlightedShelfId}
            onSelect={(shelf: ShelfLocation) => setSelectedShelfId(shelf.id)}
          />
        </Card>

        <Card>
          {selectedShelfId ? (
            <ShelfDetail
              key={selectedShelfId}
              shelfId={selectedShelfId}
              onDeleted={() => setSelectedShelfId(null)}
            />
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-heading">
                No shelf selected
              </p>
              <p className="mt-1 text-xs text-body">
                Select a shelf on the map to view its products and assign
                medicines.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

ShelfLocationsPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
ShelfLocationsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'table', 'form'])),
  },
});
