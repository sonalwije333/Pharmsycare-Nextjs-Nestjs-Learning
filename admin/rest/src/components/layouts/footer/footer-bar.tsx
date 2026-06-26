import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import { useSettings } from '@/contexts/settings.context';

export type IFooterProp = {
  className?: string;
};

const APP_VERSION = '1.0.0';

const Footer: React.FC<IFooterProp> = ({ className }) => {
  const { siteTitle, siteLink } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="mx-auto w-full">
        <div className="flex flex-col items-center justify-between gap-1 bg-white px-5 py-5 text-sm text-body sm:flex-row md:px-8">
          <span className="text-center sm:text-start">
            &copy; {year}{' '}
            <Link
              className="font-medium text-heading transition-colors hover:text-accent"
              href={siteLink ?? Routes?.dashboard}
            >
              {siteTitle}
            </Link>
            . All rights reserved.
          </span>
          <span className="font-medium text-muted">v {APP_VERSION}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
