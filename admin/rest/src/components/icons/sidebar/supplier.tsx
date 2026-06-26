export const SupplierIcon: React.FC<React.SVGAttributes<{}>> = (props) => (
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
    <path d="M1.5 4.5h11v10h-11z" />
    <path d="M12.5 8h4.5l3 3v3.5h-7.5z" />
    <circle cx="6" cy="17.5" r="2" />
    <circle cx="16.5" cy="17.5" r="2" />
    <path d="M8 17.5h6.5M1.5 17.5h2.5M18.5 17.5h1.5" />
  </svg>
);
