import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useCreateShelfLocationMutation } from '@/data/shelf-location';

interface Props {
  onClose: () => void;
}

const PRESET_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
];

export default function ShelfForm({ onClose }: Props) {
  const { mutate: createShelf, isLoading } = useCreateShelfLocationMutation();
  const [form, setForm] = useState({
    code: '',
    name: '',
    zone: 'General',
    aisle: '',
    row_index: 0,
    column_index: 0,
    color: PRESET_COLORS[0],
    capacity: '',
  });

  const update = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      return;
    }
    createShelf(
      {
        code: form.code.trim(),
        name: form.name.trim(),
        zone: form.zone.trim() || 'General',
        aisle: form.aisle.trim() || undefined,
        row_index: Number(form.row_index) || 0,
        column_index: Number(form.column_index) || 0,
        color: form.color,
        capacity: form.capacity ? Number(form.capacity) : undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="code"
          label="Shelf Code"
          required
          placeholder="A1"
          value={form.code}
          onChange={(e) => update('code', e.target.value)}
        />
        <Input
          name="zone"
          label="Zone"
          placeholder="Zone A"
          value={form.zone}
          onChange={(e) => update('zone', e.target.value)}
        />
      </div>

      <Input
        name="name"
        label="Shelf Name"
        required
        placeholder="Analgesics & Painkillers"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
      />

      <Input
        name="aisle"
        label="Aisle (optional)"
        placeholder="Aisle 1"
        value={form.aisle}
        onChange={(e) => update('aisle', e.target.value)}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          name="row_index"
          label="Map Row"
          type="number"
          min={0}
          value={form.row_index}
          onChange={(e) => update('row_index', e.target.value)}
        />
        <Input
          name="column_index"
          label="Map Column"
          type="number"
          min={0}
          value={form.column_index}
          onChange={(e) => update('column_index', e.target.value)}
        />
        <Input
          name="capacity"
          label="Capacity"
          type="number"
          min={0}
          placeholder="100"
          value={form.capacity}
          onChange={(e) => update('capacity', e.target.value)}
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-body">
          Map Colour
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => update('color', color)}
              style={{ backgroundColor: color }}
              className={`h-8 w-8 rounded-full border-2 transition ${
                form.color === color
                  ? 'scale-110 border-heading'
                  : 'border-transparent'
              }`}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="small" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="small" loading={isLoading}>
          Create Shelf
        </Button>
      </div>
    </form>
  );
}
