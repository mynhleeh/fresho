'use client';
import { useCountUp } from '../../../components/hooks/useCountUp';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { RouteArt } from './RouteArt';
import styles from './OrdersHero.module.css';

function StatTile({ label, value, format, featured }: { label: string; value: number; format: (n: number) => string; featured?: boolean }) {
  const shown = useCountUp(value);
  return (
    <div className={`${styles.tile} ${featured ? styles.tileFeatured : ''}`}>
      <span className={styles.tileValue}>{format(shown)}</span>
      <span className={styles.tileLabel}>{label}</span>
    </div>
  );
}

export function OrdersHero({ todoCount, followingCount, remainingAmount }: { todoCount: number; followingCount: number; remainingAmount: number }) {
  return (
    <section className={styles.hero} aria-label="Tổng quan đơn hàng">
      <div className={styles.art}><RouteArt /></div>
      <div className={styles.tiles}>
        <StatTile label="Việc cần làm" value={todoCount} format={String} featured />
        <StatTile label="Đang theo dõi" value={followingCount} format={String} />
        <StatTile label="Tổng còn phải trả (dự kiến)" value={remainingAmount} format={formatVnd} />
      </div>
    </section>
  );
}
