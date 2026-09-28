import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { preOrderDisplayInfo } from '@/lib/order/orderStatus';
import { formatHarvestDate } from '@/lib/order/orderDisplayText';
import { AgreementPanel, type AgreementResponder } from './AgreementPanel';
import { MoneyTiles } from './MoneyTiles';
import { OrderActionButtons } from './OrderActionButtons';
import { TrustRing } from '../../../components/order/TrustRing';
import type { ActionKind } from '../data/orderActionCopy';
import { moneyOf, progressPercentOf, type FarmerPreOrder } from '../data/orderTypes';
import styles from './orderCard.module.css';

type Props = {
  order: FarmerPreOrder;
  featured: boolean;
  busy: boolean;
  viewerId: string | null;
  agreementBusy: boolean;
  onRespond: AgreementResponder;
  onOpen: (order: FarmerPreOrder) => void;
  onAct: (order: FarmerPreOrder, kind: ActionKind) => void;
};

export function OrderCard({ order, featured, busy, viewerId, agreementBusy, onRespond, onOpen, onAct }: Props) {
  const status = preOrderDisplayInfo(order.status, order.farmerConfirmedAt != null);
  const percent = progressPercentOf(order.status);
  const unit = order.batch.unit ?? 'kg';

  return (
    <Card className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <AgreementPanel order={order} viewerId={viewerId} busy={agreementBusy} onRespond={onRespond} />
      <button type="button" className={styles.opener} onClick={() => onOpen(order)} aria-label={`Xem chi tiết đơn ${order.batch.cropName} của ${order.buyer.name}`}>
        <span className={styles.head}>
          <span className={styles.crop}>{order.batch.cropName}</span>
          <StatusBadge label={status.label} tone={status.tone} />
        </span>
        <span className={styles.buyer}>
          <TrustRing score={order.buyer.trustScore} subject="Người mua" />
          <span className={styles.buyerText}>
            <span className={styles.buyerName}>{order.buyer.name}</span>
            <span className={styles.quantity}>{order.quantity.toLocaleString('vi-VN')} {unit}{formatHarvestDate(order.batch.harvestDateEstimate) && ` · Thu hoạch dự kiến ${formatHarvestDate(order.batch.harvestDateEstimate)}`}</span>
          </span>
        </span>
        <span className={styles.progress} role="img" aria-label={`Tiến độ đơn ${percent}%`}>
          <span className={styles.progressFill} style={{ width: `${percent}%` }} />
        </span>
      </button>
      <MoneyTiles money={moneyOf(order)} />
      <OrderActionButtons order={order} busy={busy} onAct={onAct} />
    </Card>
  );
}
