import { buildTimeline } from '@/lib/order/orderWorkflow';
import { preOrderStatusInfo } from '@/lib/order/orderStatus';
import styles from './OrderTimeline.module.css';

const STATE_TEXT = { done: 'Đã qua', current: 'Hiện tại', upcoming: 'Sắp tới' } as const;

export function OrderTimeline({ status }: { status: string }) {
  const steps = buildTimeline(status);
  const isStopped = status === 'rejected' || status === 'cancelled';
  const doneCount = steps.filter((step) => step.state === 'done').length;
  const currentIndex = steps.findIndex((step) => step.state === 'current');
  const reachedIndex = currentIndex === -1 ? doneCount - 1 : currentIndex;
  const fillPercent = isStopped ? 0 : Math.max(0, (reachedIndex / (steps.length - 1)) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {isStopped && (
          <p className={styles.stopped} role="status">
            {preOrderStatusInfo(status).label}: đơn không tiếp tục theo các bước dưới đây.
          </p>
        )}
        <ol className={styles.track} aria-label="Tiến trình đơn hàng" style={{ '--fill-ratio': fillPercent / 100 } as React.CSSProperties}>
          {steps.map((step, index) => (
            <li key={step.status} className={`${styles.step} ${styles[step.state]}`} aria-current={step.state === 'current' ? 'step' : undefined}>
              <span className={styles.dot} aria-hidden="true">{index + 1}</span>
              <span className={styles.label}>{preOrderStatusInfo(step.status).label}</span>
              <span className={styles.stateText}>{STATE_TEXT[step.state]}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
