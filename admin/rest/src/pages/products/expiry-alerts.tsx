import Card from '@/components/common/card';
import Layout from '@/components/layouts/admin';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import Search from '@/components/common/search';
import { adminOnly } from '@/utils/auth-utils';
import { ProductExpiryAlertType } from '@/types';
import { useProductExpiryQuery } from '@/data/product';
import { useRouter } from 'next/router';
import CategoryTypeFilter from '@/components/filters/category-type-filter';
import cn from 'classnames';
import { ArrowDown } from '@/components/icons/arrow-down';
import { ArrowUp } from '@/components/icons/arrow-up';
import PageHeading from '@/components/common/page-heading';
import ProductExpiryAlerts from '@/components/product/product-expiry-alerts';
import Select from '@/components/ui/select/select';

const alertTypeOptions = [
  { value: ProductExpiryAlertType.ALL, label: 'All alerts' },
  { value: ProductExpiryAlertType.EXPIRED, label: 'Expired' },
  { value: ProductExpiryAlertType.EXPIRING, label: 'Expiring soon' },
];

export default function ProductExpiryAlertsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [alertType, setAlertType] = useState<ProductExpiryAlertType>(
    ProductExpiryAlertType.ALL,
  );
  const { locale } = useRouter();
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    setVisible((value) => !value);
  };

  const { products, paginatorInfo, loading, error } = useProductExpiryQuery({
    language: locale,
    name: searchTerm,
    limit: 10,
    page,
    alert_type: alertType,
    days_before: 30,
    type,
    categories: category,
  });

  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;

  function handleSearch({ searchText }: { searchText: string }) {
    setSearchTerm(searchText);
    setPage(1);
  }

  function handlePagination(current: number) {
    setPage(current);
  }

  const selectedAlertType =
    alertTypeOptions.find((option) => option.value === alertType) ?? null;

  return (
    <>
      <Card className="mb-8 flex flex-col">
        <div className="flex w-full flex-col items-center md:flex-row">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <PageHeading title="Drug Expiry Alerts" />
            <p className="mt-2 text-sm text-body">
              Review expired drugs and items expiring within 30 days.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-3 md:ms-auto md:w-2/3 md:flex-row">
            <Search onSearch={handleSearch} />
            <Select
              options={alertTypeOptions}
              value={selectedAlertType}
              onChange={(option: any) => {
                setPage(1);
                setAlertType(option?.value ?? ProductExpiryAlertType.ALL);
              }}
              className="w-full min-w-[180px] md:w-auto"
            />
          </div>

          <button
            className="mt-5 flex items-center whitespace-nowrap text-base font-semibold text-accent md:mt-0 md:ms-5"
            onClick={toggleVisible}
            type="button"
          >
            {t('common:text-filter')}{' '}
            {visible ? <ArrowUp className="ms-2" /> : <ArrowDown className="ms-2" />}
          </button>
        </div>

        <div
          className={cn('flex w-full transition', {
            'visible h-auto': visible,
            'invisible h-0': !visible,
          })}
        >
          <div className="mt-5 flex w-full flex-col border-t border-gray-200 pt-5 md:mt-8 md:flex-row md:items-center md:pt-8">
            <CategoryTypeFilter
              className="w-full"
              onCategoryFilter={({ slug }: { slug: string }) => {
                setPage(1);
                setCategory(slug);
              }}
              onTypeFilter={({ slug }: { slug: string }) => {
                setType(slug);
                setPage(1);
              }}
              enableCategory
              enableType
            />
          </div>
        </div>
      </Card>

      <ProductExpiryAlerts
        products={products}
        paginatorInfo={paginatorInfo}
        onPagination={handlePagination}
        title="Drug expiry alerts"
      />
    </>
  );
}

ProductExpiryAlertsPage.authenticate = {
  permissions: adminOnly,
};
ProductExpiryAlertsPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['table', 'common', 'form'])),
  },
});
