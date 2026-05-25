import { PaymentStatus } from '@/types';

export type OrderStatusOption = {
  name: string;
  status: string;
  serial: number;
};

export const ORDER_STATUS: OrderStatusOption[] = [
  { name: 'text-order-pending', status: 'order-pending', serial: 1 },
  { name: 'text-order-processing', status: 'order-processing', serial: 2 },
  {
    name: 'text-order-at-local-facility',
    status: 'order-at-local-facility',
    serial: 3,
  },
  {
    name: 'text-order-out-for-delivery',
    status: 'order-out-for-delivery',
    serial: 4,
  },
  { name: 'text-order-completed', status: 'order-completed', serial: 5 },
  { name: 'text-order-cancelled', status: 'order-cancelled', serial: 5 },
  { name: 'text-order-refunded', status: 'order-refunded', serial: 5 },
  { name: 'text-order-failed', status: 'order-failed', serial: 5 },
];

export function getOrderStatusOption(
  orderStatus?: string
): OrderStatusOption | undefined {
  if (!orderStatus) return undefined;
  return ORDER_STATUS.find((option) => option.status === orderStatus);
}

export function resolveOrderStatusValue(order_status: unknown): string | undefined {
  if (!order_status) return undefined;
  if (typeof order_status === 'string') return order_status;
  if (typeof order_status === 'object' && order_status !== null) {
    const value = order_status as { status?: string; slug?: string };
    return value.status ?? value.slug;
  }
  return undefined;
}

export const filterOrderStatus = (
  orderStatus: any[],
  paymentStatus: PaymentStatus,
  currentStatusIndex: number
) => {
  if ([PaymentStatus.SUCCESS, PaymentStatus.COD].includes(paymentStatus)) {
    return currentStatusIndex > 4
      ? [...orderStatus.slice(0, 4), orderStatus[currentStatusIndex]]
      : orderStatus.slice(0, 5);
  }

  return currentStatusIndex > 4
    ? [...orderStatus.slice(0, 2), orderStatus[currentStatusIndex]]
    : orderStatus.slice(0, 5);
};
