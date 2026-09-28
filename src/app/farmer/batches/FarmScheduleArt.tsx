import styles from './page.module.css';

export function FarmScheduleArt() {
  return (
    <svg viewBox="0 0 480 120" className={styles.headerArt} preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 96 C 90 70, 150 110, 240 84 S 390 58, 480 82" className={styles.headerArtPath} />
      <g className={styles.headerArtRow}>
        <path d="M20 108 C 10 96, 10 84, 20 76" strokeLinecap="round" />
        <path d="M60 108 C 50 92, 50 78, 60 68" strokeLinecap="round" />
        <path d="M100 108 C 90 96, 90 84, 100 76" strokeLinecap="round" />
        <path d="M140 108 C 130 92, 130 78, 140 68" strokeLinecap="round" />
      </g>
      <g className={styles.headerArtRow} transform="translate(220 4)">
        <path d="M20 108 C 10 96, 10 84, 20 76" strokeLinecap="round" />
        <path d="M60 108 C 50 92, 50 78, 60 68" strokeLinecap="round" />
        <path d="M100 108 C 90 96, 90 84, 100 76" strokeLinecap="round" />
        <path d="M140 108 C 130 92, 130 78, 140 68" strokeLinecap="round" />
        <path d="M180 108 C 170 92, 170 78, 180 68" strokeLinecap="round" />
      </g>
      <circle cx="428" cy="30" r="22" className={styles.headerArtSun} />
    </svg>
  );
}

export function EmptyFieldArt() {
  return (
    <svg viewBox="0 0 220 160" className={styles.emptyArt} aria-hidden="true">
      <ellipse cx="110" cy="140" rx="96" ry="14" className={styles.emptyArtShadow} />
      <path d="M30 132 C 20 90, 40 58, 78 50 C 104 44, 118 62, 112 84 C 150 78, 178 96, 176 124" className={styles.emptyArtFurrow} />
      <g className={styles.emptyArtCrate}>
        <rect x="76" y="86" width="68" height="46" rx="6" />
        <path d="M76 104 h68 M96 86 v46 M124 86 v46" />
      </g>
      <path d="M92 86 C 88 70, 96 60, 106 62" className={styles.emptyArtSprout} strokeLinecap="round" />
      <path d="M118 86 C 122 66, 114 54, 128 50" className={styles.emptyArtSprout} strokeLinecap="round" />
    </svg>
  );
}
