import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { OrderCard, type OrderCardVariant } from '../card/OrderCard';
import type { OrderFilter } from './OrderFilterTabs';
import type { ActionKind } from '../data/orderActionCopy';
import { GROUP_LABEL, groupOf, type FarmerPreOrder } from '../data/orderTypes';
import styles from './orderSections.module.css';

const PAGE_SIZE = 8;

type Props = {
  orders: FarmerPreOrder[];
  filter: OrderFilter;
  busy: boolean;
  onAct: (order: FarmerPreOrder, kind: ActionKind) => void;
};

function variantOf(order: FarmerPreOrder): OrderCardVariant {
  const group = groupOf(order);
  if (group === 'needs_action') return 'queue';
  return group === 'done' ? 'done' : 'tracking';
}

export function OrderSections({ orders, filter, busy, onAct }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const queue = orders.filter((order) => groupOf(order) === 'needs_action');
  const rest = orders.filter((order) => groupOf(order) !== 'needs_action' && (filter === 'all' || groupOf(order) === filter));
  const visibleRest = rest.slice(0, visibleCount);
  const tracking = visibleRest.filter((order) => groupOf(order) === 'in_progress');
  const done = visibleRest.filter((order) => groupOf(order) === 'done');
  const hiddenCount = Math.max(0, rest.length - visibleCount);
  const showQueue = filter === 'all' || filter === 'needs_action';
  const card = (order: FarmerPreOrder) => <OrderCard key={order.id} order={order} variant={variantOf(order)} busy={busy} onAct={onAct} />;

  return (
    <>
      {showQueue && queue.length > 0 && (
        <section className={styles.queue} aria-label="Đơn cần xử lý">
          <h2 className={styles.heading}>
            Cần xử lý ngay
            <span className={styles.headingCount}>{queue.length}</span>
          </h2>
          <div className={styles.queueGrid}>{queue.map(card)}</div>
        </section>
      )}
      {tracking.length > 0 && (
        <section className={styles.tracking} aria-label="Đơn đang theo dõi">
          <h2 className={styles.trackingHeading}>{GROUP_LABEL.in_progress}</h2>
          <div className={styles.strips}>{tracking.map(card)}</div>
        </section>
      )}
      {done.length > 0 && (
        <section className={styles.done} aria-label="Đơn đã hoàn tất">
          <h2 className={styles.doneHeading}>{GROUP_LABEL.done}</h2>
          <div className={styles.chips}>{done.map(card)}</div>
        </section>
      )}
      {hiddenCount > 0 && (
        <Button variant="outline" onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>
          Xem thêm {Math.min(hiddenCount, PAGE_SIZE)} đơn (còn {hiddenCount})
        </Button>
      )}
      {queue.length + rest.length === 0 && <p className={styles.none}>Không có đơn nào trong nhóm này.</p>}
    </>
  );
}
