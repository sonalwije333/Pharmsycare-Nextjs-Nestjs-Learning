import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import {
  useBranchVendorsQuery,
  useCreateBranchMutation,
} from '@/data/branch';

interface Props {
  onClose: () => void;
}

export default function BranchForm({ onClose }: Props) {
  const { mutate: createBranch, isLoading } = useCreateBranchMutation();
  const { vendors } = useBranchVendorsQuery();
  const [form, setForm] = useState({
    code: '',
    name: '',
    city: '',
    address: '',
    phone: '',
    manager_name: '',
    vendor_id: '',
    is_main: false,
  });

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    createBranch(
      {
        code: form.code.trim(),
        name: form.name.trim(),
        city: form.city.trim() || undefined,
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        manager_name: form.manager_name.trim() || undefined,
        vendor_id: form.vendor_id ? Number(form.vendor_id) : undefined,
        is_main: form.is_main,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="code"
          label="Branch Code"
          required
          placeholder="BR-COL"
          value={form.code}
          onChange={(e) => update('code', e.target.value)}
        />
        <Input
          name="city"
          label="City"
          placeholder="Colombo"
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
        />
      </div>

      <Input
        name="name"
        label="Branch Name"
        required
        placeholder="Colombo Main Branch"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
      />

      <Input
        name="address"
        label="Address"
        placeholder="45 Galle Road, Colombo 03"
        value={form.address}
        onChange={(e) => update('address', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="phone"
          label="Phone"
          placeholder="+94112345678"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        <Input
          name="manager_name"
          label="Manager"
          placeholder="Branch manager"
          value={form.manager_name}
          onChange={(e) => update('manager_name', e.target.value)}
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-body">
          Connect Vendor
        </span>
        <select
          value={form.vendor_id}
          onChange={(e) => update('vendor_id', e.target.value)}
          className="h-12 w-full rounded border border-border-base bg-gray-100 px-3 text-sm text-heading focus:border-accent focus:bg-light focus:outline-none"
        >
          <option value="">No vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name} ({vendor.email})
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-heading">
        <input
          type="checkbox"
          checked={form.is_main}
          onChange={(e) => update('is_main', e.target.checked)}
        />
        Set as main / head-office branch
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="small" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="small" loading={isLoading}>
          Create Branch
        </Button>
      </div>
    </form>
  );
}
