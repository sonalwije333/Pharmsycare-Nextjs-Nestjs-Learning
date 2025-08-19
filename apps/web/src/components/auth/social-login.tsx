import { signIn } from 'next-auth/react';
import { GoogleIcon, FacebookIcon } from '@/components/icons';
import { useTranslation } from 'next-i18next';
import Button from '@/components/ui/button';

interface SocialLoginProps {
  isLoading: boolean;
  variant?: 'default' | 'checkout';
}

export default function SocialLogin({ isLoading, variant = 'default' }: SocialLoginProps) {
  const { t } = useTranslation('common');

  const handleSocialLogin = async (provider: string) => {
    try {
      await signIn(provider, {
        callbackUrl: window.location.href
      });
    } catch (error) {
      console.error('Social login error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 mt-2">
      <Button
        className={`!bg-social-google !text-light hover:!bg-social-google-hover ${
          variant === 'checkout' ? 'h-11 sm:h-12' : ''
        }`}
        disabled={isLoading}
        onClick={() => handleSocialLogin('google')}
      >
        <GoogleIcon className="w-4 h-4 ltr:mr-3 rtl:ml-3" />
        {t('text-login-google')}
      </Button>

      <Button
        className={`!bg-social-facebook !text-light hover:!bg-social-facebook-hover ${
          variant === 'checkout' ? 'h-11 sm:h-12' : ''
        }`}
        disabled={isLoading}
        onClick={() => handleSocialLogin('facebook')}
      >
        <FacebookIcon className="w-4 h-4 ltr:mr-3 rtl:ml-3" />
        {t('text-login-facebook')}
      </Button>
    </div>
  );
}