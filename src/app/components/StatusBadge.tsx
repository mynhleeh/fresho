import type { StatusTone } from '@/lib/orderStatus';
import styles from './StatusBadge.module.css';

export function StatusBadge({ label, tone, id }: { label: string; tone: StatusTone; id?: string }) {
  return <span id={id} className={`${styles.badge} ${styles[tone]}`}>{label}</span>;
}
