import type { CSSProperties, ReactNode } from 'react';
import styles from './TrustRing.module.css';

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// TODO(business-confirm): trust_score scale assumed 0-100
const MAX_TRUST_SCORE = 100;

export function TrustRing({ score, children }: { score: number; children: ReactNode }) {
  const ratio = Math.min(Math.max(score / MAX_TRUST_SCORE, 0), 1);
  const ringStyle = {
    '--ring-length': CIRCUMFERENCE,
    '--ring-filled': CIRCUMFERENCE * ratio,
  } as CSSProperties;

  return (
    <div className={styles.ring} role="img" aria-label={score === 0 ? 'Nông dân mới, chưa có đánh giá' : `Điểm uy tín ${score} trên ${MAX_TRUST_SCORE}`}>
      <svg viewBox="0 0 80 80" className={styles.svg} aria-hidden="true">
        <circle cx="40" cy="40" r={RADIUS} className={styles.track} />
        <circle cx="40" cy="40" r={RADIUS} className={styles.fill} style={ringStyle} strokeDasharray={`${CIRCUMFERENCE * ratio} ${CIRCUMFERENCE}`} />
      </svg>
      <div className={styles.center}>{children}</div>
    </div>
  );
}
