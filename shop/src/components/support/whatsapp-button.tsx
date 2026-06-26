import { useSettings } from '@/framework/settings';
import { useTranslation } from 'next-i18next';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.13 6.744 3.052 9.38L1.05 31.32l6.156-1.968A15.9 15.9 0 0 0 16.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0Zm9.318 22.594c-.386 1.09-1.92 1.994-3.142 2.258-.836.178-1.928.32-5.604-1.204-4.7-1.948-7.726-6.724-7.962-7.034-.226-.31-1.9-2.53-1.9-4.826 0-2.296 1.166-3.424 1.636-3.904.386-.394.844-.574 1.336-.574.158 0 .3.008.43.014.386.016.58.038.834.646.316.764 1.088 2.66 1.18 2.854.094.194.188.456.056.766-.124.32-.234.46-.428.708-.194.248-.378.438-.572.704-.178.232-.378.482-.154.872.224.382.996 1.64 2.138 2.656 1.474 1.312 2.668 1.718 3.098 1.898.32.132.702.1.94-.156.302-.33.674-.876 1.052-1.414.268-.386.606-.434.96-.3.36.124 2.246 1.058 2.632 1.25.386.194.642.286.736.448.092.164.092.93-.294 2.02Z" />
  </svg>
);

const WhatsAppButton = () => {
  const { settings } = useSettings();
  const { t } = useTranslation('common');

  const rawNumber =
    settings?.contactDetails?.pharmacistWhatsApp ||
    settings?.contactDetails?.contact ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    '';

  const digits = String(rawNumber).replace(/[^\d]/g, '');
  if (!digits) {
    return null;
  }

  const prefill = encodeURIComponent(t('text-whatsapp-prefill'));
  const href = `https://wa.me/${digits}?text=${prefill}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('text-chat-with-pharmacist')}
      title={t('text-chat-with-pharmacist')}
      className="fixed bottom-16 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#1ebe57] focus:outline-none ltr:right-4 rtl:left-4 lg:bottom-6 ltr:lg:right-6 rtl:lg:left-6"
    >
      <WhatsAppIcon className="h-8 w-8" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#1ebe57]" />
      </span>
    </a>
  );
};

export default WhatsAppButton;
