import type { CSSProperties } from 'react';
import styles from './landing.module.css';

const SPROUT_ROWS = [
  { y: 402, count: 11, scale: 0.8, spacing: 50, offset: 14 },
  { y: 446, count: 10, scale: 1, spacing: 58, offset: 0 },
  { y: 496, count: 9, scale: 1.2, spacing: 66, offset: 22 },
];

function sproutPositions() {
  return SPROUT_ROWS.flatMap((row, rowIndex) =>
    Array.from({ length: row.count }, (_, index) => ({
      key: `${rowIndex}-${index}`,
      x: row.offset + index * row.spacing,
      y: row.y,
      scale: row.scale,
      delay: `${((index * 7 + rowIndex * 3) % 10) * -0.35}s`,
    })),
  );
}

function Sprout({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={styles.sprout} style={{ animationDelay: delay } as CSSProperties}>
        <path d="M0 0 C -1 -9, 1 -17, 0 -26" stroke="#2f6b2a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M0 -14 C -10 -18, -16 -14, -18 -8 C -10 -6, -4 -9, 0 -14 Z" fill="#4c8b3a" />
        <path d="M0 -20 C 9 -27, 17 -24, 19 -17 C 11 -14, 5 -16, 0 -20 Z" fill="#6aa84f" />
      </g>
    </g>
  );
}

function SceneLandscape() {
  return (
    <>
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6ecd2" />
          <stop offset="0.65" stopColor="#f3f1e4" />
        </linearGradient>
        <linearGradient id="hero-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe0b4" />
          <stop offset="1" stopColor="#a9c98a" />
        </linearGradient>
      </defs>
      <rect width="560" height="560" fill="url(#hero-sky)" />
      <g className={styles.sunGlow}>
        <circle cx="408" cy="150" r="92" fill="#f1d9a0" opacity="0.45" />
      </g>
      <circle cx="408" cy="150" r="52" fill="#e3b04b" />
      <g className={styles.cloudSlow}>
        <path d="M60 118 h96 a18 18 0 0 0 -30 -18 a26 26 0 0 0 -48 6 a16 16 0 0 0 -18 12 Z" fill="#fffdf6" opacity="0.9" />
      </g>
      <g className={styles.cloudFast}>
        <path d="M300 78 h70 a14 14 0 0 0 -22 -14 a20 20 0 0 0 -36 5 a12 12 0 0 0 -12 9 Z" fill="#fffdf6" opacity="0.8" />
      </g>
      <g className={styles.hillFar}>
        <path d="M-40 290 C 60 230, 150 250, 240 272 C 330 294, 420 222, 600 256 L 600 560 L -40 560 Z" fill="#9fbf86" />
      </g>
      <g className={styles.hillMid}>
        <path d="M-40 330 C 80 290, 190 318, 290 322 C 400 326, 470 282, 600 300 L 600 560 L -40 560 Z" fill="#6f9c55" />
        <path d="M120 318 l0 -34 m-10 14 l10 -14 l10 14" stroke="#3e6d31" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M470 296 l0 -40 m-12 16 l12 -16 l12 16 m-20 12 l8 -8 l8 8" stroke="#3e6d31" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M-20 372 C 120 344, 300 352, 580 360 L 580 560 L -20 560 Z" fill="url(#hero-field)" />
      <path d="M-20 420 C 150 404, 360 410, 580 414" stroke="#8fb472" strokeWidth="2" fill="none" />
      <path d="M-20 470 C 150 456, 360 462, 580 466" stroke="#8fb472" strokeWidth="2" fill="none" />
    </>
  );
}

function SceneRoute() {
  return (
    <g>
      <path d="M40 540 C 140 470, 250 470, 300 410 S 430 330, 520 330" stroke="#fffdf6" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.7" />
      <path className={styles.routeDash} d="M40 540 C 140 470, 250 470, 300 410 S 430 330, 520 330" stroke="#c9922f" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="2 12" />
      <g transform="translate(496 300)">
        <rect x="0" y="0" width="44" height="30" rx="4" fill="#fffdf6" stroke="#1b5e20" strokeWidth="2.5" />
        <path d="M0 10 h44 M14 0 v30 M30 0 v30" stroke="#1b5e20" strokeWidth="2" />
      </g>
    </g>
  );
}

export function HeroScene() {
  return (
    <div className={styles.heroVisual}>
      <div className={styles.heroFrame}>
        <svg viewBox="0 0 560 560" className={styles.heroSvg} role="img" aria-label="Cánh đồng đang vào mùa, tuyến giao hàng từ nông trại tới điểm nhận">
          <SceneLandscape />
          <SceneRoute />
          {sproutPositions().map(({ key, ...sprout }) => <Sprout key={key} {...sprout} />)}
        </svg>
      </div>
      <BatchPreviewCard />
      <div className={`${styles.floatingChip} ${styles.floatSlow}`}>
        <span className={styles.chipDot} aria-hidden="true" />
        Đã nhận cọc · giữ chỗ lô hàng
      </div>
    </div>
  );
}

function BatchPreviewCard() {
  return (
    <div className={`${styles.batchCard} ${styles.floatFast}`}>
      <span className={styles.batchCardEyebrow}>Ví dụ lô hàng</span>
      <span className={styles.batchCardTitle}>Cà chua beef · Đà Lạt</span>
      <span className={styles.batchCardMeta}>Thu hoạch sau 9 ngày</span>
      <div className={styles.batchProgressTrack} aria-hidden="true">
        <span className={styles.batchProgressFill} />
      </div>
      <span className={styles.batchCardMeta}>
        <strong className={styles.batchCardStrong}>620</strong> / 1.000 kg đã được đặt trước
      </span>
    </div>
  );
}
