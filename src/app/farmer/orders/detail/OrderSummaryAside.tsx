import { TrustRing } from '../../../components/order/TrustRing';
import { MoneyTiles } from './MoneyTiles';
import { OrderActionButtons } from './OrderActionButtons';
import type { ActionKind } from '../data/orderActionCopy';
import { moneyOf, type FarmerOrderDetail, type FarmerPreOrder } from '../data/orderTypes';
import styles from './orderSummaryAside.module.css';

type Props = {
  order: FarmerOrderDetail;
  busy: boolean;
  onAct: (order: FarmerPreOrder, kind: ActionKind) => void;
};

export function OrderSummaryAside({ order, busy, onAct }: Props) {
  return (
    <div className={styles.ticket}>
      <section className={styles.buyer} aria-label="Người mua">
        <TrustRing score={order.buyer.trustScore} subject="Người mua" size={84} />
        <div className={styles.buyerText}>
          <span className={styles.eyebrow}>Người mua</span>
          <strong className={styles.name}>{order.buyer.name}</strong>
        </div>
      </section>
      <section className={styles.money} aria-label="Tiền hàng">
        <MoneyTiles money={moneyOf(order)} />
      </section>
      <section className={styles.actions} aria-label="Thao tác">
        <OrderActionButtons order={order} busy={busy} onAct={onAct} />
      </section>
    </div>
  );
}
