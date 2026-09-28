import type { StatusTone } from '@/lib/order/orderStatus';
import { CheckCircleIcon, ClockIcon, CrossCircleIcon, InfoCircleIcon, WarningIcon } from './icons';
import styles from './StatusBadge.module.css';

const TONE_ICON = {
  neutral: InfoCircleIcon,
  warning: ClockIcon,
  info: InfoCircleIcon,
  success: CheckCircleIcon,
  danger: CrossCircleIcon,
} satisfies Record<StatusTone, typeof WarningIcon>;

export function StatusBadge({ label, tone, id }: { label: string; tone: StatusTone; id?: string }) {
  const Icon = TONE_ICON[tone];
  return (
    <span id={id} className={`${styles.badge} ${styles[tone]}`}>
      <Icon className={styles.icon} />
      {label}
    </span>
  );
}
