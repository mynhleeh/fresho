export function RouteArt() {
  return (
    <svg viewBox="0 0 360 140" role="img" aria-label="Lộ trình nông sản từ vườn qua xe giao đến bếp của bạn">
      <path d="M0 118 C 90 104, 270 104, 360 118 V140 H0 Z" fill="var(--color-sage)" />
      <path d="M40 108 C 110 40, 190 130, 250 70 S 310 60, 322 74" stroke="var(--color-leaf-mid)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" fill="none" />
      <g transform="translate(22 66)">
        <path d="M18 42 C 16 24, 18 10, 18 0" stroke="var(--color-leaf-deep)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M18 22 C 2 16, -6 24, -6 34 C 8 34, 14 30, 18 22 Z" fill="var(--color-leaf-bright)" />
        <path d="M18 12 C 32 2, 46 8, 46 20 C 32 22, 24 20, 18 12 Z" fill="var(--color-leaf-mid)" />
        <circle cx="30" cy="36" r="8" fill="var(--color-warning)" />
      </g>
      <g transform="translate(140 62)" data-motion="truck">
        <rect x="0" y="6" width="44" height="28" rx="4" fill="var(--color-gold-tint)" stroke="var(--color-gold-deep)" strokeWidth="2" />
        <path d="M44 14 h14 l8 10 v10 h-22 Z" fill="var(--color-paper)" stroke="var(--color-gold-deep)" strokeWidth="2" />
        <circle cx="14" cy="38" r="6" fill="var(--color-ink)" />
        <circle cx="52" cy="38" r="6" fill="var(--color-ink)" />
      </g>
      <g transform="translate(276 50)">
        <rect x="0" y="16" width="62" height="46" rx="6" fill="var(--color-paper)" stroke="var(--color-primary)" strokeWidth="2.5" />
        <path d="M-4 18 L31 0 L66 18 Z" fill="var(--color-primary)" />
        <rect x="24" y="34" width="14" height="28" rx="2" fill="var(--color-gold-tint)" />
        <circle cx="50" cy="32" r="5" fill="var(--color-warning)" />
      </g>
    </svg>
  );
}
