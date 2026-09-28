import type { ReactNode } from 'react';
import type { FarmerGroup } from '@/lib/order/orderWorkflow';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { CheckCircleIcon, ClockIcon, DepositIcon, WarningIcon } from '../../../components/ui/icons';
import { GROUP_LABEL } from '../data/orderTypes';
import { useCountUp } from '../../../components/hooks/useCountUp';
import { OrdersHarvestArt } from './OrdersArt';
import styles from './orderSummary.module.css';

const GROUP_ICON: Record<FarmerGroup, ReactNode> = {
  needs_action: <WarningIcon className={styles.icon} />,
  in_progress: <ClockIcon className={styles.icon} />,
  done: <CheckCircleIcon className={styles.icon} />,
};

function CountTile({ group, count }: { group: FarmerGroup; count: number }) {
  const shown = useCountUp(count);
  return (
    <div className={`${styles.tile} ${styles[group]}`}>
      {GROUP_ICON[group]}
      <span className={styles.number}>{shown}</span>
      <span className={styles.tileLabel}>{GROUP_LABEL[group]}</span>
    </div>
  );
}

function ExpectedTile({ amount }: { amount: number }) {
  const shown = useCountUp(amount);
  return (
    <div className={`${styles.tile} ${styles.expected}`}>
      <DepositIcon className={styles.icon} />
      <span className={styles.money}>{formatVnd(shown)}</span>
      <span className={styles.tileLabel}>Tiền hàng dự kiến nhận</span>
    </div>
  );
}

export function OrderSummary({ counts, expectedTotal }: { counts: Record<FarmerGroup, number>; expectedTotal: number }) {
  return (
    <section className={styles.band} aria-label="Tổng quan đơn đặt trước">
      <div className={styles.art}><OrdersHarvestArt /></div>
      <div className={styles.tiles}>
        <CountTile group="needs_action" count={counts.needs_action} />
        <CountTile group="in_progress" count={counts.in_progress} />
        <CountTile group="done" count={counts.done} />
        <ExpectedTile amount={expectedTotal} />
      </div>
    </section>
  );
}
