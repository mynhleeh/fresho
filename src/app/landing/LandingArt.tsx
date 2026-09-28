import styles from './landing.module.css';

export function SignatureFlourish() {
  return (
    <svg viewBox="0 0 220 24" className={styles.flourish} aria-hidden="true">
      <path d="M4 16 C 40 4, 80 4, 110 12 S 180 22, 216 8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function SeasonRouteArt() {
  return (
    <svg viewBox="0 0 400 120" className={styles.routeArt} preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 90 C 90 10, 170 130, 250 60 S 350 20, 400 40" className={styles.routePath} />
    </svg>
  );
}

export function LeafSprigArt() {
  return (
    <svg viewBox="0 0 80 96" className={styles.sprigArt} aria-hidden="true">
      <path d="M40 94 C 38 66, 42 40, 40 8" stroke="var(--color-leaf-deep)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 60 C 16 56, 6 42, 6 28 C 26 28, 38 42, 40 60 Z" fill="var(--color-leaf-bright)" />
      <path d="M40 40 C 62 34, 74 22, 74 8 C 54 10, 42 22, 40 40 Z" fill="var(--color-sage-strong)" />
    </svg>
  );
}

export function CrateArt() {
  return (
    <svg viewBox="0 0 96 72" className={styles.crateArt} aria-hidden="true">
      <circle cx="26" cy="20" r="13" fill="var(--color-warning)" />
      <circle cx="50" cy="16" r="14" fill="var(--color-danger)" />
      <circle cx="72" cy="21" r="12" fill="var(--color-warning)" />
      <rect x="4" y="26" width="88" height="42" rx="6" fill="var(--color-kraft)" stroke="var(--color-soil)" strokeWidth="2.5" />
      <path d="M4 40 h88 M4 54 h88" stroke="var(--color-soil)" strokeWidth="2.5" />
    </svg>
  );
}
