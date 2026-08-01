export const StarDoodle = ({ className = '', size = 24, color = 'var(--accent)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`decoration-star ${className}`}>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill={color} opacity="0.6" />
  </svg>
);

export const Squiggle = ({ className = '', color = 'var(--accent)' }) => (
  <svg width="60" height="20" viewBox="0 0 60 20" fill="none" className={`decoration-star ${className}`}>
    <path d="M2 10C8 4 14 16 20 10C26 4 32 16 38 10C44 4 50 16 58 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
  </svg>
);

export const Dots = ({ className = '' }) => (
  <svg width="40" height="12" viewBox="0 0 40 12" fill="none" className={`decoration-star ${className}`}>
    <circle cx="4" cy="6" r="2.5" fill="var(--accent)" opacity="0.5" />
    <circle cx="16" cy="6" r="2.5" fill="var(--accent)" opacity="0.35" />
    <circle cx="28" cy="6" r="2.5" fill="var(--accent)" opacity="0.2" />
  </svg>
);

export const Sparkles = ({ className = '' }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={`decoration-star ${className}`}>
    <path d="M10 0L12 7L20 10L12 13L10 20L8 13L0 10L8 7L10 0Z" fill="var(--accent)" opacity="0.5" />
  </svg>
);

export const HeartIcon = ({ filled = false, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill={filled ? 'var(--accent)' : 'none'} stroke="var(--accent)" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const WaveEmoji = () => (
  <span style={{ display: 'inline-block', animation: 'wiggle 2s ease-in-out infinite' }}>👋</span>
);

export const CuteMascot = ({ className = '' }) => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className={className}>
    <circle cx="40" cy="45" r="30" fill="var(--accent)" opacity="0.9" />
    <ellipse cx="40" cy="45" rx="25" ry="22" fill="var(--accent)" />
    <circle cx="32" cy="40" r="4" fill="#fff" />
    <circle cx="48" cy="40" r="4" fill="#fff" />
    <circle cx="33" cy="39" r="2" fill="#1a1512" />
    <circle cx="49" cy="39" r="2" fill="#1a1512" />
    <path d="M36 50C38 53 42 53 44 50" stroke="#1a1512" strokeWidth="2" strokeLinecap="round" />
    <circle cx="26" cy="46" r="3" fill="#ff6b6b" opacity="0.4" />
    <circle cx="54" cy="46" r="3" fill="#ff6b6b" opacity="0.4" />
    <path d="M30 25C32 18 38 18 40 25" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 25C42 18 48 18 50 25" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
