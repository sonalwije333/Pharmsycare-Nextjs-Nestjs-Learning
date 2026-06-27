export const ShelfIcon: React.FC<React.SVGAttributes<{}>> = (props) => (
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
    <rect x="3" y="3" width="18" height="18" rx="1.5" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M7.5 5.5v1.5" />
    <path d="M11.5 5.5v1.5" />
    <path d="M7.5 11.5V13" />
    <path d="M11.5 11.5V13" />
    <path d="M7.5 17.5V19" />
    <path d="M11.5 17.5V19" />
  </svg>
);
