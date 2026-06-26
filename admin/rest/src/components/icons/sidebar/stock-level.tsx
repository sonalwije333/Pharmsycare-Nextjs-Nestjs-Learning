export const StockLevelIcon: React.FC<React.SVGAttributes<{}>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 20h18" />
    <rect x="4" y="12" width="4" height="6" rx="0.5" />
    <rect x="10" y="8" width="4" height="10" rx="0.5" />
    <rect x="16" y="4" width="4" height="14" rx="0.5" />
  </svg>
);
