import { pickAgreementForDisplay } from '@/lib/order/orderWorkflow';
import { describeBuyerWaiting, formatHarvestDate } from '@/lib/order/orderDisplayText';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatVnd } from '../../../components/order/MoneySummaryRow';
import { DEPOSIT_PERCENT } from '@/lib/order/depositAmount';
import { AgreementBanner, type AgreementView } from '../../../components/agreement/AgreementBanner';
import {
  canBuyerCancel, canReportIssue, getDepositDue, getOrderStatusInfo, getOrderMoney, getOrderPrimaryAction,
  type BuyerPreOrder,
} from '../data/orderView';
import { PaidSplitBar, StatusProgress } from './OrderVisuals';
import { TrustRing } from '../../../components/order/TrustRing';
import styles from './OrderCard.module.css';

export type OrderCardHandlers = {
  onOpen: (order: BuyerPreOrder) => void;
  onPayDeposit: (order: BuyerPreOrder) => void;
  onCancel: (order: BuyerPreOrder) => void;
  onReport: (order: BuyerPreOrder) => void;
  onConfirmArrival: (order: BuyerPreOrder) => void;
  onRespond: (agreement: AgreementView, decision: 'accept' | 'decline') => void;
};

type CardProps = { order: BuyerPreOrder; alreadyRated: boolean; busy: boolean; agreementBusy: boolean; featured?: boolean } & OrderCardHandlers;

function PrimaryAction({ order, alreadyRated, busy, onOpen, onPayDeposit, onConfirmArrival }: CardProps) {
  const action = getOrderPrimaryAction(order);
  if (action === 'pay_deposit') {
    return <Button disabled={busy} onClick={() => onPayDeposit(order)}>Đặt cọc {formatVnd(getDepositDue(order))} ({DEPOSIT_PERCENT}%)</Button>;
  }
  if (action === 'confirm_arrival') return <Button disabled={busy} onClick={() => onConfirmArrival(order)}>Đã nhận hàng</Button>;
  if (action === 'propose_settlement') return <Button disabled={busy} onClick={() => onOpen(order)}>Xác nhận số lượng thực nhận</Button>;
  if (action === 'rate_farmer' && !alreadyRated) return <Button disabled={busy} onClick={() => onOpen(order)}>Đánh giá nông dân</Button>;
  if (action === 'wait_for_farmer') return <p className={styles.waiting}>{order.farmerConfirmedAt ? 'Nông dân đã xác nhận. Bạn cần đặt cọc.' : 'Đang chờ nông dân xác nhận'}</p>;
  const waiting = describeBuyerWaiting(order.status, order.deliveryMethod);
  return waiting ? <p className={styles.waiting}>{waiting}</p> : null;
}

export function OrderCard(props: CardProps) {
  const { order, busy, featured, onOpen, onCancel, onReport } = props;
  const status = getOrderStatusInfo(order);
  const agreement = pickAgreementForDisplay(order.agreements);
  const { farmer } = order.batch;
  return (
    <Card className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <div className={styles.head}>
        <div className={styles.titleBlock}>
          <button type="button" className={styles.title} onClick={() => onOpen(order)}>{order.batch.cropName}</button>
          <span className={styles.meta}>{order.quantity.toLocaleString('vi-VN')} {order.batch.unit}{formatHarvestDate(order.batch.harvestDateEstimate) && ` · Thu hoạch dự kiến ${formatHarvestDate(order.batch.harvestDateEstimate)}`}</span>
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>
      <div className={styles.farmer}>
        <TrustRing score={farmer.trustScore} subject="Nông dân" />
        <span className={styles.farmerText}>
          <span className={styles.farmerLabel}>Nông dân</span>
          <span className={styles.farmerName}>{farmer.name}</span>
        </span>
        {order.disputes.length > 0 && <span className={styles.dispute}>{order.disputes.length} báo cáo vấn đề</span>}
      </div>
      {agreement && (
        <AgreementBanner agreement={agreement} viewerId={order.buyerId} proposerName={farmer.name} unit={order.batch.unit} busy={props.agreementBusy} onRespond={props.onRespond} />
      )}
      <StatusProgress status={order.status} />
      <PaidSplitBar money={getOrderMoney(order)} settled={order.status === 'settled'} />
      <div className={styles.actions}>
        <PrimaryAction {...props} />
        <div className={styles.secondary}>
          <Button variant="outline" disabled={busy} onClick={() => onOpen(order)}>Chi tiết và nhắn tin</Button>
          {canReportIssue(order) && <Button variant="outline" disabled={busy} onClick={() => onReport(order)}>Báo vấn đề</Button>}
          {canBuyerCancel(order) && <Button variant="ghost" disabled={busy} onClick={() => onCancel(order)}>Hủy đơn</Button>}
        </div>
      </div>
    </Card>
  );
}
