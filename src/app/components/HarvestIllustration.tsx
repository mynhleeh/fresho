export function HarvestIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      role="img"
      aria-label="Nông dân đóng lô hàng thu hoạch, bên mua sỉ nhận hàng qua vận chuyển"
    >
      <ellipse cx="160" cy="182" rx="140" ry="10" fill="var(--color-primary-light)" />

      <g transform="translate(28,90)">
        <path
          d="M0 34 L54 34 L48 74 L6 74 Z"
          fill="var(--color-primary-light)"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M0 34 L54 34" stroke="var(--color-primary)" strokeWidth="2.5" />
        <path d="M8 34 L14 12 M27 34 L27 8 M46 34 L40 12" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="14" cy="8" r="6" fill="var(--color-accent-gold)" />
        <circle cx="27" cy="4" r="6" fill="var(--color-primary)" />
        <circle cx="40" cy="8" r="6" fill="var(--color-accent-gold)" />
      </g>

      <path
        d="M96 116 C 140 96, 180 96, 214 112"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeDasharray="2 8"
        strokeLinecap="round"
      />
      <path d="M206 106 L216 112 L206 120" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      <g transform="translate(214,74)">
        <path
          d="M0 26 L44 26 L44 58 L0 58 Z"
          fill="var(--color-surface)"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
        />
        <path d="M0 26 L4 6 L40 6 L44 26" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M18 58 L18 38 L26 38 L26 58" fill="var(--color-accent-gold)" stroke="var(--color-primary)" strokeWidth="2" />
        <path d="M6 34 L14 34 M6 44 L14 44 M30 34 L38 34 M30 44 L38 44" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
