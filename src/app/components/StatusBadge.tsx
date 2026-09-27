import type { StatusTone } from '@/lib/orderStatus';
import styles from './StatusBadge.module.css';

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}
