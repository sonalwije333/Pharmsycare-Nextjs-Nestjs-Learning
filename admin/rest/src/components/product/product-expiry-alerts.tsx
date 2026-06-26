import dayjs from 'dayjs';
import Image from 'next/image';
import { Table } from '@/components/ui/table';
import usePrice from '@/utils/use-price';
import { Shop, Product, MappedPaginatorInfo, ProductExpiryStatus } from '@/types';
import { useTranslation } from 'next-i18next';
import Badge from '@/components/ui/badge/badge';
import { useIsRTL } from '@/utils/locals';
import { siteSettings } from '@/settings/site.settings';
import Pagination from '../ui/pagination';
import { NoDataFound } from '@/components/icons/no-data-found';
import cn from 'classnames';

type IProps = {
  products: Product[];
  paginatorInfo: MappedPaginatorInfo | null;
  onPagination: (current: number) => void;
  searchElement?: React.ReactNode;
  title?: string;
  className?: string;
};

const ProductExpiryAlerts = ({
  products,
  title,
  searchElement,
  onPagination,
  paginatorInfo,
  className,
}: IProps) => {
  const { t } = useTranslation();
  const { alignLeft } = useIsRTL();

  const columns = [
    {
      title: t('table:table-item-id'),
      dataIndex: 'id',
      key: 'id',
      align: alignLeft,
      width: 140,
      render: (id: number) => `#${t('table:table-item-id')}: ${id}`,
    },
    {
      title: t('table:table-item-product'),
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      width: 280,
      render: (name: string, item: Product) => (
        <div className="flex items-center font-medium">
          <div className="relative aspect-square h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-200/80 bg-gray-100 me-2">
            <Image
              alt={name}
              src={item.image?.thumbnail ?? siteSettings.product.placeholder}
              fill
              priority
              sizes="(max-width: 768px) 100vw"
            />
          </div>
          <span className="truncate">{name}</span>
        </div>
      ),
    },
    {
      title: t('table:table-item-sku'),
      dataIndex: 'sku',
      key: 'sku',
      align: alignLeft,
      ellipsis: true,
      width: 150,
      render: (sku: string) => (
        <span className="truncate whitespace-nowrap">{sku}</span>
      ),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      align: alignLeft,
      width: 150,
      render: (expiryDate: string) =>
        expiryDate ? dayjs(expiryDate).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'Alert',
      dataIndex: 'expiry_status',
      key: 'expiry_status',
      align: 'center',
      width: 170,
      render: (status: ProductExpiryStatus, item: Product) => {
        if (status === ProductExpiryStatus.EXPIRED) {
          return (
            <Badge
              text="Expired"
              className="bg-status-failed/10 text-status-failed capitalize"
            />
          );
        }

        return (
          <Badge
            text={`Expires in ${item.days_until_expiry} day(s)`}
            className="bg-status-processing/10 text-status-processing"
            animate
          />
        );
      },
    },
    {
      title: t('table:table-item-shop'),
      dataIndex: 'shop',
      key: 'shop',
      ellipsis: true,
      align: alignLeft,
      width: 200,
      render: (shop: Shop) => (
        <span className="truncate">{shop?.name ?? '-'}</span>
      ),
    },
    {
      title: t('table:table-item-quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 120,
    },
    {
      title: t('table:table-item-unit'),
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: 120,
      render: function Render(value: number) {
        const { price } = usePrice({ amount: value });
        return <span className="whitespace-nowrap font-medium">{price}</span>;
      },
    },
  ];

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg bg-white p-6 md:p-7',
        className,
      )}
    >
      <div className="flex items-center justify-between pb-7">
        <h3 className="before:content-'' relative mt-1 bg-light text-lg font-semibold text-heading before:absolute before:-top-px before:h-7 before:w-1 before:rounded-tr-md before:rounded-br-md before:bg-accent ltr:before:-left-6 rtl:before:-right-6 md:before:-top-0.5 md:ltr:before:-left-7 md:rtl:before:-right-7 lg:before:h-8">
          {title}
        </h3>
        {searchElement}
      </div>
      <Table
        //@ts-ignore
        columns={columns}
        emptyText={() => (
          <div className="flex flex-col items-center py-7">
            <NoDataFound className="w-52" />
            <div className="mb-1 pt-6 text-base font-semibold text-heading">
              {t('table:empty-table-data')}
            </div>
            <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
          </div>
        )}
        data={products}
        rowKey="id"
        scroll={{ x: 900 }}
      />
      {!!paginatorInfo?.total && (
        <div className="flex items-center justify-between py-2">
          <div className="mt-2 text-gray-500">
            {paginatorInfo?.currentPage} of {paginatorInfo?.lastPage} pages
          </div>
          <Pagination
            total={paginatorInfo?.total}
            current={paginatorInfo?.currentPage}
            pageSize={paginatorInfo?.perPage}
            onChange={onPagination}
          />
        </div>
      )}
    </div>
  );
};

export default ProductExpiryAlerts;
