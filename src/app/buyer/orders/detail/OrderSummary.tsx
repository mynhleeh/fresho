import { TrustRing } from '../../../components/order/TrustRing';
import type { BuyerOrderDetail } from '../data/orderView';
import type { OrderFlow } from '../data/useOrderFlow';
import { OrderActions } from './OrderActions';
import { PaymentSummary } from './MoneyPanels';
import styles from './OrderSummary.module.css';

type SummaryProps = { order: BuyerOrderDetail; alreadyRated: boolean; flow: OrderFlow };

export function OrderSummary({ order, alreadyRated, flow }: SummaryProps) {
  const { farmer } = order.batch;
  return (
    <div className={styles.ticket}>
      <div className={styles.farmer}>
        <TrustRing score={farmer.trustScore} subject="Nông dân" size={76} />
        <span className={styles.farmerText}>
          <span className={styles.farmerLabel}>Nông dân</span>
          <span className={styles.farmerName}>{farmer.name}</span>
        </span>
      </div>
      <PaymentSummary order={order} />
      <div className={styles.actions}>
        <OrderActions order={order} alreadyRated={alreadyRated} flow={flow} />
      </div>
    </div>
  );
}
