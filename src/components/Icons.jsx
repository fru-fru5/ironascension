const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

export const CartIcon = (p) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...base} {...p}>
    <path d="M2 3h3l2.4 12.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 8H6" />
    <circle cx="9.5" cy="20.2" r="1.2" />
    <circle cx="17.5" cy="20.2" r="1.2" />
  </svg>
);
export const SearchIcon = (p) => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const MailIcon = (p) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);
export const PhoneIcon = (p) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);
export const ClockIcon = (p) => (
  <svg width="24" height="24" viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const TelegramIcon = (p) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M21.9 4.3 18.7 19c-.2 1-.8 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.7 12.3l-4.6-1.4c-1-.3-1-1 .2-1.5L20.6 2.5c.8-.3 1.5.2 1.3 1.8Z" />
  </svg>
);
export const ChatIcon = (p) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 3C6.5 3 2 6.6 2 11.1c0 2.4 1.3 4.5 3.4 6L4.5 21l4.3-2.2c1 .3 2.1.4 3.2.4 5.5 0 10-3.6 10-8.1S17.5 3 12 3Z" />
  </svg>
);
export const BackArrow = (p) => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const CloseIcon = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...base} strokeWidth="2.4" {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
);
