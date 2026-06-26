import { Product } from '@/types';
import cn from 'classnames';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { usePosMoney } from './use-pos-money';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  selectedIndex: number;
  quantities: Record<string, number>;
  onAdd: (product: Product) => void;
  onSelectIndex: (index: number) => void;
}

const placeholder = '/product-placeholder.svg';

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  selectedIndex,
  quantities,
  onAdd,
  onSelectIndex,
}) => {
  const money = usePosMoney();
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const node = cellRefs.current[selectedIndex];
    if (node) {
      node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!loading && products.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted">
        <span className="mb-1 text-base font-semibold text-heading">
          No products found
        </span>
        Try a different search term or category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => {
        const inCart = quantities[String(product.id)] ?? 0;
        const outOfStock =
          typeof product.quantity === 'number' && product.quantity <= 0;
        const isSelected = index === selectedIndex;
        const effectivePrice = Number(
          product.sale_price ?? product.price ?? 0,
        );
        return (
          <button
            key={product.id}
            type="button"
            ref={(node) => {
              cellRefs.current[index] = node;
            }}
            disabled={outOfStock}
            onMouseEnter={() => onSelectIndex(index)}
            onClick={() => onAdd(product)}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-lg border bg-white text-left transition focus:outline-none',
              outOfStock && 'cursor-not-allowed opacity-60',
              isSelected
                ? 'border-accent ring-2 ring-accent-300'
                : 'border-border-200 hover:border-accent hover:shadow-md',
            )}
          >
            {inCart > 0 ? (
              <span className="absolute end-2 top-2 z-10 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-white shadow">
                {inCart}
              </span>
            ) : null}
            <div className="relative aspect-square w-full bg-gray-50">
              <Image
                src={product.image?.thumbnail ?? placeholder}
                alt={product.name}
                fill
                sizes="160px"
                className="object-contain p-2"
              />
              {outOfStock ? (
                <span className="absolute inset-x-0 bottom-0 bg-red-500/90 py-0.5 text-center text-[10px] font-semibold uppercase text-white">
                  Out of stock
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-0.5 p-2.5">
              {product.type?.name ? (
                <span className="text-[11px] text-muted">
                  {product.type?.name}
                </span>
              ) : null}
              <span className="line-clamp-2 text-sm font-medium leading-tight text-heading">
                {product.name}
              </span>
              <span className="mt-auto pt-1 text-sm font-semibold text-accent">
                {money(effectivePrice)}
              </span>
            </div>
          </button>
        );
      })}
      {loading
        ? Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="h-48 animate-pulse rounded-lg border border-border-200 bg-gray-100"
            />
          ))
        : null}
    </div>
  );
};

export default ProductGrid;
