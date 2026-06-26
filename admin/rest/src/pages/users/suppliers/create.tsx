import Card from '@/components/common/card';
import PageHeading from '@/components/common/page-heading';
import Layout from '@/components/layouts/admin';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { useCreateSupplierMutation } from '@/data/supplier';
import { adminOnly } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function CreateSupplierPage() {
  const router = useRouter();
  const { mutate: createSupplier, isLoading } = useCreateSupplierMutation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    notes: '',
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createSupplier(
      {
        ...form,
        contact_email: form.contact_email || form.email,
      },
      {
        onSuccess: () => router.push(Routes.supplierList),
      },
    );
  };

  return (
    <Card className="mx-auto max-w-3xl p-6">
      <PageHeading title="Add Supplier" />
      <p className="mb-6 text-sm text-body">
        Creates a supplier login and profile for automated reorder email/contact alerts.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Contact name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Login email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <Input
          label="Company name"
          value={form.company_name}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          required
        />
        <Input
          label="Alert email"
          type="email"
          value={form.contact_email}
          onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          placeholder="Defaults to login email"
        />
        <Input
          label="Contact phone"
          value={form.contact_phone}
          onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
        />
        <TextArea
          label="Address"
          name="address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <TextArea
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex gap-3">
          <Button type="submit" loading={isLoading}>
            Create Supplier
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(Routes.supplierList)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

CreateSupplierPage.authenticate = {
  permissions: adminOnly,
};
CreateSupplierPage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'form'])),
  },
});
