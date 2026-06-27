import cn from 'classnames';
import { ShelfLayoutZone, ShelfLocation } from '@/types';

interface Props {
  zones: ShelfLayoutZone[];
  selectedShelfId?: number | null;
  highlightedShelfId?: number | null;
  onSelect: (shelf: ShelfLocation) => void;
}

function ShelfCell({
  shelf,
  selected,
  highlighted,
  onSelect,
}: {
  shelf: ShelfLocation;
  selected: boolean;
  highlighted: boolean;
  onSelect: (shelf: ShelfLocation) => void;
}) {
  const color = shelf.color ?? '#6366f1';
  return (
    <button
      type="button"
      onClick={() => onSelect(shelf)}
      style={{
        gridColumnStart: shelf.column_index + 1,
        gridRowStart: shelf.row_index + 1,
        borderColor: highlighted || selected ? color : undefined,
      }}
      className={cn(
        'group relative flex min-h-[88px] flex-col justify-between rounded-lg border-2 p-3 text-left transition',
        highlighted
          ? 'animate-pulse shadow-lg ring-2 ring-offset-2'
          : selected
          ? 'shadow-md'
          : 'border-border-100 hover:border-accent hover:shadow-sm',
        !shelf.is_active && 'opacity-50',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {shelf.code}
        </span>
        <span className="text-xs font-semibold text-heading">
          {shelf.product_count ?? 0}
          {shelf.capacity ? `/${shelf.capacity}` : ''}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-medium text-heading">
        {shelf.name}
      </p>
      {shelf.aisle ? (
        <p className="text-[11px] text-body">{shelf.aisle}</p>
      ) : null}
    </button>
  );
}

export default function ShelfMap({
  zones,
  selectedShelfId,
  highlightedShelfId,
  onSelect,
}: Props) {
  if (zones.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-8 text-center text-sm text-body">
        No shelves yet. Add your first shelf to start mapping the pharmacy
        layout.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {zones.map((zone) => {
        const columns =
          Math.max(0, ...zone.shelves.map((shelf) => shelf.column_index)) + 1;
        return (
          <div key={zone.zone}>
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-heading">
                {zone.zone}
              </h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-body">
                {zone.shelves.length} shelves
              </span>
            </div>
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))`,
              }}
            >
              {zone.shelves.map((shelf) => (
                <ShelfCell
                  key={shelf.id}
                  shelf={shelf}
                  selected={selectedShelfId === shelf.id}
                  highlighted={highlightedShelfId === shelf.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
