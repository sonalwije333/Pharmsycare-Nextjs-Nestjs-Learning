import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AdminLayout from '@/components/layouts/admin';
import PrescriptionForm from '@/components/prescription/prescription-form';
import { adminOwnerAndStaffOnly } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';

export default function CreatePrescriptionPage() {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">Create Prescription</h1>
        <p className="mt-2 text-sm text-body">
          Upload a prescription image or PDF and add optional notes.
        </p>
      </div>

      <PrescriptionForm
        submitLabel="Create Prescription"
        onSuccess={() => router.push(Routes.prescriptions.list)}
      />
    </div>
  );
}

CreatePrescriptionPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
CreatePrescriptionPage.Layout = AdminLayout;

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale!, ['common'])),
  },
});
