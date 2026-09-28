import type { CSSProperties } from 'react';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { buildTimeline } from '@/lib/order/orderWorkflow';
import { preOrderStatusInfo } from '@/lib/order/orderStatus';
import type { OrderMoney } from '../data/orderView';
import styles from './OrderVisuals.module.css';

export function StatusProgress({ status }: { status: string }) {
  const steps = buildTimeline(status);
  const reachedCount = steps.filter((step) => step.state !== 'upcoming').length;
  const label = preOrderStatusInfo(status).label;
  return (
    <div className={styles.progress} role="img" aria-label={`${label}, bước ${reachedCount} trên ${steps.length}`}>
      {steps.map((step) => (
        <span key={step.status} className={`${styles.pip} ${styles[step.state]}`} />
      ))}
    </div>
  );
}

export function PaidSplitBar({ money, settled }: { money: OrderMoney; settled: boolean }) {
  const total = money.paidAmount + money.remainingAmount;
  const paidPercent = total === 0 ? 0 : Math.round((money.paidAmount / total) * 100);
  const remainingLabel = settled ? 'Còn phải trả' : 'Còn phải trả (dự kiến)';
  return (
    <div className={styles.split}>
      <div className={styles.splitBar} role="img" aria-label={`Đã trả ${paidPercent}% tổng giá trị đơn`} style={{ '--paid': `${paidPercent}%` } as CSSProperties}>
        <span className={styles.splitPaid} />
      </div>
      <dl className={styles.splitLegend}>
        <div><dt>Đã trả</dt><dd>{formatVnd(money.paidAmount)}</dd></div>
        <div><dt>{remainingLabel}</dt><dd>{formatVnd(money.remainingAmount)}</dd></div>
      </dl>
    </div>
  );
}
