import styles from './TrustRing.module.css';

const RING_RADIUS = 15;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const MAX_TRUST_SCORE = 100;

export function TrustRing({ score, subject }: { score: number; subject: 'Người mua' | 'Nông dân' }) {
  const ratio = Math.max(0, Math.min(1, score / MAX_TRUST_SCORE));
  const isNew = score === 0;
  const label = isNew ? `${subject} mới, chưa có đánh giá` : `Điểm uy tín ${score} trên ${MAX_TRUST_SCORE}`;
  return (
    <span className={styles.ring} role="img" aria-label={label}>
      <svg viewBox="0 0 36 36" className={styles.svg} aria-hidden="true">
        <circle cx="18" cy="18" r={RING_RADIUS} className={styles.track} />
        <circle
          cx="18" cy="18" r={RING_RADIUS} className={styles.fill}
          strokeDasharray={RING_LENGTH} strokeDashoffset={RING_LENGTH * (1 - ratio)}
        />
      </svg>
      <span className={styles.value}>{isNew ? 'Mới' : score}</span>
    </span>
  );
}
