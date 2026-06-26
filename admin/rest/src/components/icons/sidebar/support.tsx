export const SupportIcon: React.FC<React.SVGAttributes<{}>> = (props) => (
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
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <path d="M4 13.5h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    <path d="M20 13.5h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1z" />
    <path d="M20 17.5v1a3 3 0 0 1-3 3h-3" />
  </svg>
);
