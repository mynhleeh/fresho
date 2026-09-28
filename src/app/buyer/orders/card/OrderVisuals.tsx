import type { CSSProperties } from 'react';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import type { OrderMoney } from '../data/orderView';
import styles from './OrderVisuals.module.css';

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
