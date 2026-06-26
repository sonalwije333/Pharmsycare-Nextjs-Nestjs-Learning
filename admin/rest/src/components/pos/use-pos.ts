import { Product } from '@/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DiscountType,
  HeldOrder,
  PosCartItem,
  PosCustomer,
  productToCartItem,
} from './pos-types';

const HELD_ORDERS_KEY = 'pharmsy_pos_held_orders';

function clampQuantity(quantity: number, stock?: number): number {
  const next = Math.max(1, Math.floor(quantity));
  if (typeof stock === 'number' && stock > 0) {
    return Math.min(next, stock);
  }
  return next;
}

export function usePos() {
  const [items, setItems] = useState<PosCartItem[]>([]);
  const [customer, setCustomer] = useState<PosCustomer | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HELD_ORDERS_KEY);
      if (raw) {
        setHeldOrders(JSON.parse(raw));
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const persistHeld = useCallback((next: HeldOrder[]) => {
    setHeldOrders(next);
    try {
      window.localStorage.setItem(HELD_ORDERS_KEY, JSON.stringify(next));
    } catch {
      // ignore storage write failures
    }
  }, []);

  const addProduct = useCallback((product: Product) => {
    setItems((current) => {
      const id = String(product.id);
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) =>
          item.id === id
            ? { ...item, quantity: clampQuantity(item.quantity + 1, item.stock) }
            : item,
        );
      }
      return [...current, productToCartItem(product)];
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: clampQuantity(quantity, item.stock) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const increment = useCallback((id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: clampQuantity(item.quantity + 1, item.stock) }
          : item,
      ),
    );
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setCustomer(null);
    setDiscountType('percent');
    setDiscountValue(0);
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    let discountAmount =
      discountType === 'percent'
        ? (subtotal * Math.min(Math.max(discountValue, 0), 100)) / 100
        : Math.min(Math.max(discountValue, 0), subtotal);
    discountAmount = Number(discountAmount.toFixed(2));
    const total = Number(Math.max(0, subtotal - discountAmount).toFixed(2));
    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount,
      total,
      itemCount,
    };
  }, [items, discountType, discountValue]);

  const holdCurrentOrder = useCallback(() => {
    if (items.length === 0) return;
    const held: HeldOrder = {
      id: `${Date.now()}`,
      reference: `HOLD-${String(Date.now()).slice(-5)}`,
      items,
      customer,
      discountType,
      discountValue,
      createdAt: new Date().toISOString(),
    };
    persistHeld([held, ...heldOrders]);
    reset();
  }, [
    items,
    customer,
    discountType,
    discountValue,
    heldOrders,
    persistHeld,
    reset,
  ]);

  const restoreHeldOrder = useCallback(
    (id: string) => {
      const held = heldOrders.find((order) => order.id === id);
      if (!held) return;
      setItems(held.items);
      setCustomer(held.customer);
      setDiscountType(held.discountType);
      setDiscountValue(held.discountValue);
      persistHeld(heldOrders.filter((order) => order.id !== id));
    },
    [heldOrders, persistHeld],
  );

  const removeHeldOrder = useCallback(
    (id: string) => {
      persistHeld(heldOrders.filter((order) => order.id !== id));
    },
    [heldOrders, persistHeld],
  );

  return {
    items,
    customer,
    setCustomer,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    addProduct,
    setQuantity,
    increment,
    decrement,
    removeItem,
    reset,
    totals,
    heldOrders,
    holdCurrentOrder,
    restoreHeldOrder,
    removeHeldOrder,
  };
}

export type PosController = ReturnType<typeof usePos>;
