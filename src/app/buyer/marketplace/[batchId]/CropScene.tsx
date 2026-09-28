import type { CSSProperties } from 'react';
import { deriveCropArt, type CropArtSpec } from './cropArt';
import styles from './CropScene.module.css';

const FIELD_ROWS = [
  { y: 300, count: 9, scale: 0.7, spacing: 66, offset: 10 },
  { y: 336, count: 8, scale: 0.9, spacing: 76, offset: 34 },
  { y: 380, count: 7, scale: 1.15, spacing: 90, offset: 12 },
];

const PRODUCE_SLOTS = [
  { x: 24, y: 6, rotate: -12 },
  { x: 52, y: 0, rotate: 6 },
  { x: 80, y: 7, rotate: -4 },
  { x: 108, y: 1, rotate: 10 },
  { x: 66, y: -18, rotate: 0 },
];

function sproutPositions() {
  return FIELD_ROWS.flatMap((row, rowIndex) =>
    Array.from({ length: row.count }, (_, index) => ({
      key: `${rowIndex}-${index}`,
      x: row.offset + index * row.spacing,
      y: row.y,
      scale: row.scale,
      delay: `${((index * 7 + rowIndex * 3) % 10) * -0.45}s`,
    })),
  );
}

function Sprout({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={styles.sprout} style={{ animationDelay: delay } as CSSProperties}>
        <path d="M0 0 C -1 -9, 1 -17, 0 -26" stroke="var(--color-stage-delivered)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M0 -14 C -10 -18, -16 -14, -18 -8 C -10 -6, -4 -9, 0 -14 Z" fill="var(--color-leaf-bright)" />
        <path d="M0 -20 C 9 -27, 17 -24, 19 -17 C 11 -14, 5 -16, 0 -20 Z" fill="var(--color-leaf-bright)" />
      </g>
    </g>
  );
}

function ProduceItem({ spec, x, y, rotate }: { spec: CropArtSpec; x: number; y: number; rotate: number }) {
  const transform = `translate(${x} ${y}) rotate(${rotate})`;
  if (spec.shape === 'long') {
    return (
      <g transform={transform}>
        <rect x="-8" y="-22" width="16" height="44" rx="8" fill={spec.fill} />
        <path d="M-3 -16 v30" stroke={spec.shade} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  if (spec.shape === 'ear') {
    return (
      <g transform={transform}>
        <path d="M0 24 C -1 6, 1 -10, 0 -26" stroke={spec.shade} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {[-20, -10, 0, 10].map((offsetY) => (
          <g key={offsetY}>
            <ellipse cx="-6" cy={offsetY} rx="4" ry="7" fill={spec.fill} transform={`rotate(-24 -6 ${offsetY})`} />
            <ellipse cx="6" cy={offsetY + 3} rx="4" ry="7" fill={spec.fill} transform={`rotate(24 6 ${offsetY + 3})`} />
          </g>
        ))}
      </g>
    );
  }
  if (spec.shape === 'leaf') {
    return (
      <g transform={transform}>
        <path d="M0 22 C -22 10, -22 -14, 0 -26 C 22 -14, 22 10, 0 22 Z" fill={spec.fill} />
        <path d="M0 20 V-20" stroke={spec.shade} strokeWidth="2.4" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={transform}>
      <circle cx="0" cy="0" r="17" fill={spec.fill} />
      <path d="M-9 -8 C -6 -13, 0 -14, 4 -13" stroke="var(--color-paper)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M0 -17 c 0 -5, 3 -8, 7 -8" stroke="var(--color-stage-delivered)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Crate({ spec }: { spec: CropArtSpec }) {
  return (
    <g transform="translate(330 262)">
      <ellipse cx="66" cy="98" rx="94" ry="10" fill="var(--color-stage-handover)" opacity="0.5" />
      {PRODUCE_SLOTS.map((slot) => (
        <ProduceItem key={`${slot.x}-${slot.y}`} spec={spec} {...slot} />
      ))}
      <rect x="0" y="14" width="132" height="78" rx="8" fill="var(--color-accent-gold)" />
      <path d="M0 38 h132 M0 64 h132" stroke="var(--color-gold-deep)" strokeWidth="3" />
      <path d="M16 14 v78 M116 14 v78" stroke="var(--color-gold-deep)" strokeWidth="3" />
      <rect x="40" y="44" width="52" height="24" rx="5" fill="var(--color-paper)" stroke="var(--color-primary)" strokeWidth="2" />
      <path d="M48 56 h36" stroke="var(--color-primary)" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function Backdrop() {
  return (
    <>
      <defs>
        <linearGradient id="crop-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-gold-cream)" />
          <stop offset="0.7" stopColor="var(--color-cream-edge)" />
        </linearGradient>
        <linearGradient id="crop-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-sage)" />
          <stop offset="1" stopColor="var(--color-sage-strong)" />
        </linearGradient>
      </defs>
      <rect width="560" height="420" fill="url(#crop-sky)" />
      <g className={styles.sunGlow}>
        <circle cx="430" cy="120" r="84" fill="var(--color-gold-soft)" opacity="0.5" />
      </g>
      <circle cx="430" cy="120" r="48" fill="var(--color-stage-confirming)" />
      <g className={styles.cloud}>
        <path d="M50 96 h96 a18 18 0 0 0 -30 -18 a26 26 0 0 0 -48 6 a16 16 0 0 0 -18 12 Z" fill="var(--color-paper)" opacity="0.9" />
      </g>
      <path d="M-40 230 C 60 180, 150 200, 240 222 C 330 244, 420 176, 600 208 L 600 420 L -40 420 Z" fill="var(--color-sage-strong)" />
      <path d="M-40 268 C 80 232, 190 258, 290 262 C 400 266, 470 226, 600 244 L 600 420 L -40 420 Z" fill="var(--color-stage-handover)" />
      <path d="M-20 296 C 120 278, 300 284, 580 290 L 580 420 L -20 420 Z" fill="url(#crop-field)" />
      <path d="M-20 330 C 150 318, 360 322, 580 326" stroke="var(--color-sage-strong)" strokeWidth="2" fill="none" />
      <path d="M-20 372 C 150 360, 360 364, 580 368" stroke="var(--color-sage-strong)" strokeWidth="2" fill="none" />
    </>
  );
}

export function CropScene({ cropName }: { cropName: string }) {
  const spec = deriveCropArt(cropName);
  return (
    <svg viewBox="0 0 560 420" preserveAspectRatio="xMidYMid slice" className={styles.scene} role="img" aria-label={`Cánh đồng và thùng ${cropName} vào mùa thu hoạch`}>
      <Backdrop />
      {sproutPositions().map(({ key, ...sprout }) => <Sprout key={key} {...sprout} />)}
      <Crate spec={spec} />
    </svg>
  );
}
