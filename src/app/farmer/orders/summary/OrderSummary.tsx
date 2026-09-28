import type { FarmerGroup } from '@/lib/order/orderWorkflow';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { GROUP_LABEL } from '../data/orderTypes';
import { useCountUp } from '../../../components/hooks/useCountUp';
import { OrdersHarvestArt } from './OrdersArt';
import styles from './orderSummary.module.css';

function CountNumeral({ group, count }: { group: FarmerGroup; count: number }) {
  const shown = useCountUp(count);
  return (
    <div className={`${styles.count} ${styles[group]}`}>
      <span className={styles.number}>{shown}</span>
      <span className={styles.countLabel}>{GROUP_LABEL[group]}</span>
    </div>
  );
}

function ExpectedTotal({ amount }: { amount: number }) {
  const shown = useCountUp(amount);
  return (
    <div className={styles.total}>
      <span className={styles.totalLabel}>Tiền hàng dự kiến nhận</span>
      <span className={styles.money}>{formatVnd(shown)}</span>
    </div>
  );
}

export function OrderSummary({ counts, expectedTotal }: { counts: Record<FarmerGroup, number>; expectedTotal: number }) {
  return (
    <section className={styles.band} aria-label="Tổng quan đơn đặt trước">
      <div className={styles.counts}>
        <CountNumeral group="needs_action" count={counts.needs_action} />
        <CountNumeral group="in_progress" count={counts.in_progress} />
        <CountNumeral group="done" count={counts.done} />
      </div>
      <ExpectedTotal amount={expectedTotal} />
      <div className={styles.art}><OrdersHarvestArt /></div>
    </section>
  );
}
