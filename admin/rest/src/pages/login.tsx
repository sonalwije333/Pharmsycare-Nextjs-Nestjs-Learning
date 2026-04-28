import LoginForm from '@/components/auth/login-form';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getAuthCredentials, isAuthenticated } from '@/utils/auth-utils';
import AuthPageLayout from '@/components/layouts/auth-layout';
import { Routes } from '@/config/routes';

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

export default function LoginPage() {
  const { t } = useTranslation('common');

  return (
    <AuthPageLayout>
      <h3 className="mb-6 mt-4 text-center text-base italic text-body">
        {t('admin-login-title')}
      </h3>
      <LoginForm />
    </AuthPageLayout>
  );
}
