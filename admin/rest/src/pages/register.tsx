import { useTranslation } from 'next-i18next';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import RegistrationForm from '@/components/auth/registration-form';
import { getAuthCredentials, isAuthenticated } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import AuthPageLayout from '@/components/layouts/auth-layout';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { token, permissions } = getAuthCredentials(ctx);
  if (isAuthenticated({ token, permissions })) {
    return {
      redirect: {
        destination: Routes.dashboard,
        permanent: false,
      },
    };
  }
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common', 'form'])),
    },
  };
};

export default function RegisterPage() {
  const { t } = useTranslation('common');
  return (
    <AuthPageLayout>
      <h3 className="mb-6 mt-4 text-center text-base italic text-gray-500">
        {t('admin-register-title')}
      </h3>
      <RegistrationForm />
    </AuthPageLayout>
  );
}
