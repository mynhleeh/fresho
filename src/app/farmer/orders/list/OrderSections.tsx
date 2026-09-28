import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { OrderCard } from '../card/OrderCard';
import type { OrderFilter } from './OrderFilterTabs';
import type { AgreementResponder } from '../card/AgreementPanel';
import type { ActionKind } from '../data/orderActionCopy';
import { groupOf, type FarmerPreOrder } from '../data/orderTypes';
import styles from './orderSections.module.css';

const PAGE_SIZE = 8;

type Props = {
  orders: FarmerPreOrder[];
  filter: OrderFilter;
  busy: boolean;
  viewerId: string | null;
  agreementBusy: boolean;
  onRespond: AgreementResponder;
  onOpen: (order: FarmerPreOrder) => void;
  onAct: (order: FarmerPreOrder, kind: ActionKind) => void;
};

export function OrderSections({ orders, filter, busy, viewerId, agreementBusy, onRespond, onOpen, onAct }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const queue = orders.filter((order) => groupOf(order) === 'needs_action');
  const rest = orders.filter((order) => groupOf(order) !== 'needs_action' && (filter === 'all' || groupOf(order) === filter));
  const hiddenCount = Math.max(0, rest.length - visibleCount);
  const showQueue = filter === 'all' || filter === 'needs_action';
  const card = (order: FarmerPreOrder, featured: boolean) => (
    <OrderCard key={order.id} order={order} featured={featured} busy={busy} viewerId={viewerId} agreementBusy={agreementBusy} onRespond={onRespond} onOpen={onOpen} onAct={onAct} />
  );

  return (
    <>
      {showQueue && queue.length > 0 && (
        <section className={styles.queue} aria-label="Đơn cần xử lý">
          <h2 className={styles.heading}>Cần xử lý ngay</h2>
          <div className={styles.queueGrid}>{queue.map((order) => card(order, true))}</div>
        </section>
      )}
      {rest.length > 0 && <div className={styles.list}>{rest.slice(0, visibleCount).map((order) => card(order, false))}</div>}
      {hiddenCount > 0 && (
        <Button variant="outline" onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>
          Xem thêm {Math.min(hiddenCount, PAGE_SIZE)} đơn (còn {hiddenCount})
        </Button>
      )}
      {queue.length + rest.length === 0 && <p className={styles.none}>Không có đơn nào trong nhóm này.</p>}
    </>
  );
}
