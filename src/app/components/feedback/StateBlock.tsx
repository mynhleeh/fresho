import type { ReactNode } from 'react';
import { LeafIcon, WarningIcon } from '../ui/icons';
import { Button } from '../ui/Button';
import styles from './StateBlock.module.css';

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className={styles.skeletonList} role="status" aria-busy="true" aria-label="Đang tải">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow} />
      ))}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className={styles.block}>
      <LeafIcon className={styles.icon} />
      <p className={styles.title}>{title}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={`${styles.block} ${styles.error}`} role="alert">
      <WarningIcon className={styles.icon} />
      <p className={styles.title}>{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Thử lại</Button>}
    </div>
  );
}
