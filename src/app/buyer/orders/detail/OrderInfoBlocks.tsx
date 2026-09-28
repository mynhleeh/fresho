import { formatHarvestDate } from '@/lib/order/orderDisplayText';
import { preOrderStatusInfo } from '@/lib/order/orderStatus';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { ActionGroup } from '../../../components/ui/ActionGroup';
import { DetailBlock } from '../../../components/order/DetailBlock';
import { canProposeCancel, type BuyerOrderDetail, type DisputeView } from '../data/orderView';
import type { OrderFlow } from '../data/useOrderFlow';
import styles from './OrderInfoBlocks.module.css';

const DISPUTE_TONE: Record<string, 'success' | 'warning'> = { resolved: 'success' };
const DISPUTE_LABEL: Record<string, string> = { open: 'Đang xử lý', resolved: 'Đã giải quyết' };

export function DeliveryBlock({ order }: { order: BuyerOrderDetail }) {
  if (!order.delivery) return null;
  const info = preOrderStatusInfo(order.delivery.status);
  return (
    <DetailBlock title="Vận chuyển" eyebrow="Bàn giao" tone="tint">
      <StatusBadge label={info.label} tone={info.tone} />
      <p className={styles.note}>{order.delivery.trackingNote ?? 'Chưa có ghi chú vận chuyển.'}</p>
    </DetailBlock>
  );
}

export function ContactBlock({ order }: { order: BuyerOrderDetail }) {
  const { farmer } = order.batch;
  const hasContact = Boolean(farmer.phone || farmer.address);
  return (
    <DetailBlock title="Liên hệ nông dân" eyebrow="Người trồng" tone="kraft">
      {hasContact ? (
        <div className={styles.contact}>
          <p className={styles.contactName}>{farmer.name}</p>
          {farmer.phone && <p className={styles.contactPhone}>{farmer.phone}</p>}
          {farmer.address && <p className={styles.note}>{farmer.address}</p>}
        </div>
      ) : (
        <p className={styles.note}>Thông tin liên hệ sẽ hiện khi đơn sẵn sàng bàn giao.</p>
      )}
    </DetailBlock>
  );
}

function DisputeRow({ dispute }: { dispute: DisputeView }) {
  return (
    <li className={styles.dispute}>
      <div className={styles.disputeHead}>
        <StatusBadge label={DISPUTE_LABEL[dispute.status] ?? dispute.status} tone={DISPUTE_TONE[dispute.status] ?? 'warning'} />
        <time className={styles.date} dateTime={dispute.createdAt}>{formatHarvestDate(dispute.createdAt)}</time>
      </div>
      <p className={styles.note}>{dispute.reason}</p>
      {dispute.resolutionNote && <p className={styles.note}>Kết quả: {dispute.resolutionNote}</p>}
    </li>
  );
}

export function DisputeList({ disputes }: { disputes: DisputeView[] }) {
  if (disputes.length === 0) return null;
  return (
    <DetailBlock title={`Báo cáo vấn đề (${disputes.length})`} eyebrow="Cần theo dõi" tone="tint">
      <ul className={styles.disputes}>{disputes.map((dispute) => <DisputeRow key={dispute.id} dispute={dispute} />)}</ul>
    </DetailBlock>
  );
}

export function ProposeCancelBlock({ order, flow }: { order: BuyerOrderDetail; flow: OrderFlow }) {
  if (!canProposeCancel(order)) return null;
  return (
    <DetailBlock title="Hủy đơn đã đặt cọc" tone="plain">
      <p className={styles.note}>Đơn đã đặt cọc chỉ hủy được khi nông dân đồng ý.</p>
      <ActionGroup>
        <Button variant="ghost" disabled={flow.busy} onClick={() => flow.openCancelProposal(order)}>Đề nghị hủy đơn</Button>
      </ActionGroup>
    </DetailBlock>
  );
}
