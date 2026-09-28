import styles from './ordersArt.module.css';

export function OrdersHarvestArt() {
  return (
    <svg viewBox="0 0 320 150" className={styles.art} role="img" aria-label="Thùng nông sản và luống rau chờ giao cho người mua">
      <circle cx="262" cy="34" r="20" fill="var(--color-gold-soft)" />
      <path d="M0 122 C 80 108, 200 108, 320 122 V150 H0 Z" fill="var(--color-sage)" />
      <path d="M0 136 C 100 124, 220 124, 320 136 V150 H0 Z" fill="var(--color-sage-strong)" />
      <g transform="translate(40 60)">
        <circle cx="18" cy="8" r="14" fill="var(--color-warning)" />
        <circle cx="46" cy="4" r="15" fill="var(--color-danger)" />
        <circle cx="74" cy="9" r="13" fill="var(--color-warning)" />
        <rect x="0" y="12" width="92" height="56" rx="6" fill="var(--color-accent-gold)" />
        <path d="M0 32 h92 M0 50 h92 M14 12 v56 M78 12 v56" stroke="var(--color-gold-deep)" strokeWidth="3" />
      </g>
      <g transform="translate(170 78)">
        <path d="M8 -4 C 4 -22, 18 -28, 24 -10 M34 -6 C 32 -26, 48 -28, 50 -8 M60 -4 C 60 -22, 74 -24, 74 -6" stroke="var(--color-leaf-bright)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <rect x="0" y="0" width="82" height="50" rx="6" fill="var(--color-accent-gold)" />
        <path d="M0 17 h82 M0 34 h82" stroke="var(--color-gold-deep)" strokeWidth="3" />
      </g>
      <g transform="translate(236 70)">
        <path d="M0 52 C -2 30, 2 12, 0 -4" stroke="var(--color-stage-delivered)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M0 26 C -18 18, -26 26, -28 36 C -14 38, -4 34, 0 26 Z" fill="var(--color-leaf-bright)" />
        <path d="M0 10 C 16 0, 28 4, 30 14 C 16 18, 6 16, 0 10 Z" fill="var(--color-leaf-mid)" />
      </g>
    </svg>
  );
}
