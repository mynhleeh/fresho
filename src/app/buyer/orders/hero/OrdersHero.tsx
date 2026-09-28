'use client';
import { useCountUp } from '../../../components/hooks/useCountUp';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { RouteArt } from './RouteArt';
import styles from './OrdersHero.module.css';

function Numeral({ value, format, className, label }: { value: number; format: (n: number) => string; className: string; label: string }) {
  const shown = useCountUp(value);
  return (
    <p className={className}>
      <span className={styles.numeral}>{format(shown)}</span>
      <span className={styles.caption}>{label}</span>
    </p>
  );
}

export function OrdersHero({ todoCount, followingCount, remainingAmount }: { todoCount: number; followingCount: number; remainingAmount: number }) {
  return (
    <section className={styles.hero} aria-label="Tổng quan đơn hàng">
      <div className={styles.art}><RouteArt /></div>
      <div className={styles.stats}>
        <Numeral value={todoCount} format={String} className={styles.todo} label="Việc cần làm" />
        <Numeral value={followingCount} format={String} className={styles.following} label="Đang theo dõi" />
        <Numeral value={remainingAmount} format={formatVnd} className={styles.owed} label="Tổng còn phải trả (dự kiến)" />
      </div>
    </section>
  );
}
