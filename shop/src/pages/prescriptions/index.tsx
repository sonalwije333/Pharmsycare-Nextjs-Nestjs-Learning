import type { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const PrescriptionsPage: NextPage = () => {
  useTranslation('common');

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
      <h1 className="mb-4 text-2xl font-semibold text-heading sm:text-3xl">
        Upload Your Prescription
      </h1>
      <p className="text-base text-body">
        Prescription upload flow will be available here.
      </p>
    </div>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default PrescriptionsPage;
