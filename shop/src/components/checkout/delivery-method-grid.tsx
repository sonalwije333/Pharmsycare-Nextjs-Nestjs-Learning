import { RadioGroup } from '@headlessui/react';
import { useAtom } from 'jotai';
import classNames from 'classnames';
import { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useSettings } from '@/framework/settings';
import {
  deliveryMethodAtom,
  pickupLocationAtom,
  DeliveryMethod,
} from '@/store/checkout';

interface DeliveryMethodProps {
  label: string;
  className?: string;
  count?: number;
}

const OPTIONS: Array<{
  value: DeliveryMethod;
  title: string;
  description: string;
}> = [
  {
    value: 'delivery',
    title: 'Home Delivery',
    description: 'Get your medicines delivered to your address.',
  },
  {
    value: 'pickup',
    title: 'In-store Pickup',
    description: 'Collect your order from the pharmacy.',
  },
];

export const DeliveryMethodGrid: React.FC<DeliveryMethodProps> = ({
  label,
  className,
  count,
}) => {
  const { t } = useTranslation('common');
  const { settings }: any = useSettings();
  const [method, setMethod] = useAtom(deliveryMethodAtom);
  const [, setPickupLocation] = useAtom(pickupLocationAtom);

  const storeName = settings?.siteTitle ?? 'Sethma Pharmacy';
  const storeLocation = `${storeName} - Main Branch`;

  useEffect(() => {
    setPickupLocation(method === 'pickup' ? storeLocation : null);
  }, [method, storeLocation]);

  return (
    <div className={className}>
      <div className="mb-5 flex items-center justify-between md:mb-8">
        <div className="flex items-center space-x-3 rtl:space-x-reverse md:space-x-4">
          {count && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-base text-light lg:text-xl">
              {count}
            </span>
          )}
          <p className="text-lg capitalize text-heading lg:text-xl">{label}</p>
        </div>
      </div>

      <RadioGroup value={method} onChange={setMethod}>
        <RadioGroup.Label className="sr-only">{label}</RadioGroup.Label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <RadioGroup.Option value={option.value} key={option.value}>
              {({ checked }) => (
                <div
                  className={classNames(
                    'group relative cursor-pointer rounded border p-4 hover:border-accent',
                    {
                      'border-accent shadow-sm': checked,
                      'border-transparent bg-gray-100': !checked,
                    },
                  )}
                >
                  <span className="mb-2 block text-sm font-semibold text-heading">
                    {option.title}
                  </span>
                  <span className="block text-sm text-body">
                    {option.description}
                  </span>
                </div>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>

      {method === 'pickup' ? (
        <div className="mt-4 rounded border border-dashed border-accent bg-accent/5 p-4">
          <p className="text-sm font-semibold text-heading">
            {t('text-pickup-location') !== 'text-pickup-location'
              ? t('text-pickup-location')
              : 'Pickup location'}
          </p>
          <p className="mt-1 text-sm text-body">{storeLocation}</p>
          {settings?.contactDetails?.location?.formattedAddress ? (
            <p className="mt-1 text-xs text-body">
              {settings.contactDetails.location.formattedAddress}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default DeliveryMethodGrid;
