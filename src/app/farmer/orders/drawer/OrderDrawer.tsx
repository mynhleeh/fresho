'use client';
import { Overlay } from '../../../components/feedback/Overlay';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { OrderMessageThread } from '../../../components/order-thread/OrderMessageThread';
import { RatingForm } from '../../../components/order-thread/RatingForm';
import { LedgerSection } from '../../../components/order/LedgerSection';
import { OrderTimeline } from '../../../components/order/OrderTimeline';
import { HarvestProgressLog } from '../../../components/order-thread/HarvestProgressLog';
import { preOrderDisplayInfo } from '@/lib/order/orderStatus';
import { HarvestProgressActions } from './HarvestProgressActions';
import { MoneyTiles } from '../card/MoneyTiles';
import { AgreementPanel, type AgreementResponder } from '../card/AgreementPanel';
import { OrderActionButtons } from '../card/OrderActionButtons';
import { TrustRing } from '../../../components/order/TrustRing';
import type { ActionKind } from '../data/orderActionCopy';
import { canProposeCancel } from '../data/orderActionCopy';
import { moneyOf, type FarmerPreOrder } from '../data/orderTypes';
import styles from './orderDrawer.module.css';

type Props = {
  order: FarmerPreOrder;
  userId: string | null;
  busy: boolean;
  agreementBusy: boolean;
  onRespond: AgreementResponder;
  onProposeCancel: (order: FarmerPreOrder) => void;
  showToast: (tone: 'success' | 'error', text: string) => void;
  onAct: (order: FarmerPreOrder, kind: ActionKind) => void;
  onChanged: () => void;
  onClose: () => void;
};

function BuyerContact({ order }: { order: FarmerPreOrder }) {
  const { phone, address } = order.buyer;
  if (!phone && !address) {
    return <p className={styles.note}>Số điện thoại và địa chỉ người mua sẽ hiện khi đơn sẵn sàng bàn giao.</p>;
  }
  return (
    <dl className={styles.contact}>
      {phone && <div><dt>Số điện thoại</dt><dd><a href={`tel:${phone}`}>{phone}</a></dd></div>}
      {address && <div><dt>Địa chỉ</dt><dd>{address}</dd></div>}
    </dl>
  );
}

export function OrderDrawer({ order, userId, busy, agreementBusy, onRespond, onProposeCancel, showToast, onAct, onChanged, onClose }: Props) {
  const status = preOrderDisplayInfo(order.status, order.farmerConfirmedAt != null);
  const canUpdateHarvest = ['deposited', 'awaiting_harvest'].includes(order.status);

  return (
    <Overlay open onClose={onClose} label={`Chi tiết đơn ${order.batch.cropName}`} variant="drawer">
      <div className={styles.body}>
        <header className={styles.head}>
          <div className={styles.headText}>
            <span className={styles.eyebrow}>Chi tiết đơn</span>
            <h2 className={styles.title}>{order.batch.cropName}</h2>
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
          <Button variant="outline" onClick={onClose} aria-label="Đóng chi tiết đơn">Đóng</Button>
        </header>
        <div className={styles.buyer}>
          <TrustRing score={order.buyer.trustScore} subject="Người mua" />
          <strong>{order.buyer.name}</strong>
        </div>
        <AgreementPanel order={order} viewerId={userId} busy={agreementBusy} onRespond={onRespond} />
        <OrderTimeline status={order.status} />
        <MoneyTiles money={moneyOf(order)} />
        <OrderActionButtons order={order} busy={busy} onAct={onAct} />
        {canUpdateHarvest && (
          <>
            <HarvestProgressActions batchId={order.batchId} quantityTotal={order.batch.quantityTotal} showToast={showToast} onDone={onChanged} />
            <HarvestProgressLog batchId={order.batchId} />
          </>
        )}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Lịch sử giao dịch</h3>
          <LedgerSection preOrderId={order.id} versionKey={order.status} />
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông tin liên hệ người mua</h3>
          <BuyerContact order={order} />
        </section>
        {userId && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Trao đổi với người mua</h3>
            <OrderMessageThread preOrderId={order.id} currentUserId={userId} />
          </section>
        )}
        {canProposeCancel(order) && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Hủy đơn đã đặt cọc</h3>
            <p className={styles.note}>Nếu không thể giao hàng, bạn có thể đề nghị hủy đơn. Đơn chỉ hủy khi người mua đồng ý.</p>
            <Button variant="outline" disabled={busy || agreementBusy} onClick={() => onProposeCancel(order)}>Đề nghị hủy đơn</Button>
          </section>
        )}
        {order.status === 'settled' && userId && (
          <RatingForm preOrderId={order.id} alreadyRated={order.ratings.some((r) => r.raterId === userId)} onSubmitted={onChanged} />
        )}
      </div>
    </Overlay>
  );
}
