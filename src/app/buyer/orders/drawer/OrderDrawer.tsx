'use client';
import { pickAgreementForDisplay } from '@/lib/order/orderWorkflow';
import { Button } from '../../../components/ui/Button';
import { Overlay } from '../../../components/feedback/Overlay';
import { MoneySummaryRow, formatVnd } from '../../../components/order/MoneySummaryRow';
import { OrderMessageThread } from '../../../components/order-thread/OrderMessageThread';
import { HarvestProgressLog } from '../../../components/order-thread/HarvestProgressLog';
import { RatingForm } from '../../../components/order-thread/RatingForm';
import { OrderTimeline } from '../../../components/order/OrderTimeline';
import { LedgerSection } from '../../../components/order/LedgerSection';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { preOrderStatusInfo } from '@/lib/order/orderStatus';
import { AgreementBanner, type AgreementView } from '../../../components/agreement/AgreementBanner';
import { ProposeSettlementForm } from './ProposeSettlementForm';
import {
  canBuyerCancel, canProposeCancel, canReportIssue, getOrderMoney, getOrderPrimaryAction, getOrderStatusInfo, sumDeposits,
  type BuyerPreOrder,
} from '../data/orderView';
import styles from './OrderDrawer.module.css';

export type DrawerHandlers = {
  onProposeSettlement: (order: BuyerPreOrder, finalQuantity: number) => void;
  onRespond: (agreement: AgreementView, decision: 'accept' | 'decline') => void;
  agreementBusy: boolean;
  onRated: () => void;
};

function MoneyBlock({ order }: { order: BuyerPreOrder }) {
  const money = getOrderMoney(order);
  const settled = order.status === 'settled';
  return (
    <section className={styles.block}>
      <h3 className={styles.blockTitle}>Thanh toán</h3>
      <MoneySummaryRow label="Tiền hàng" value={formatVnd(money.goodsAmount)} />
      <MoneySummaryRow label="Tiền cọc đã trả" value={formatVnd(sumDeposits(order))} />
      <MoneySummaryRow label={settled ? 'Cước vận chuyển' : 'Cước vận chuyển (ước tính)'} value={formatVnd(money.shippingFee)} />
      {order.settlement && settled ? (
        <MoneySummaryRow label="Thanh toán cuối" value={formatVnd(order.settlement.finalPaymentAmount)} emphasis />
      ) : (
        <MoneySummaryRow label="Còn phải trả (ước tính)" value={formatVnd(money.remainingAmount)} emphasis />
      )}
    </section>
  );
}

function DeliveryBlock({ order }: { order: BuyerPreOrder }) {
  if (!order.delivery) return null;
  const info = preOrderStatusInfo(order.delivery.status);
  return (
    <section className={styles.block}>
      <h3 className={styles.blockTitle}>Vận chuyển</h3>
      <StatusBadge label={info.label} tone={info.tone} />
      <p className={styles.note}>{order.delivery.trackingNote ?? 'Chưa có ghi chú vận chuyển.'}</p>
    </section>
  );
}

function ContactBlock({ order }: { order: BuyerPreOrder }) {
  const { farmer } = order.batch;
  return (
    <section className={styles.block}>
      <h3 className={styles.blockTitle}>Liên hệ nông dân</h3>
      {farmer.phone || farmer.address ? (
        <p className={styles.note}>{farmer.name}{farmer.phone && <> · {farmer.phone}</>}{farmer.address && <><br />{farmer.address}</>}</p>
      ) : (
        <p className={styles.note}>Thông tin liên hệ sẽ hiện khi đơn sẵn sàng bàn giao.</p>
      )}
    </section>
  );
}

function DrawerActions({ order, busy, onPayDeposit, onCancel, onReport, onConfirmArrival }: { order: BuyerPreOrder; busy: boolean } & Pick<DrawerCommands, 'onPayDeposit' | 'onCancel' | 'onReport' | 'onConfirmArrival'>) {
  const action = getOrderPrimaryAction(order);
  return (
    <div className={styles.actions}>
      {action === 'pay_deposit' && <Button disabled={busy} onClick={() => onPayDeposit(order)}>Đặt cọc</Button>}
      {action === 'confirm_arrival' && <Button disabled={busy} onClick={() => onConfirmArrival(order)}>Đã nhận hàng</Button>}
      {canReportIssue(order) && <Button variant="outline" disabled={busy} onClick={() => onReport(order)}>Báo vấn đề</Button>}
      {canBuyerCancel(order) && <Button variant="ghost" disabled={busy} onClick={() => onCancel(order)}>Hủy đơn</Button>}
    </div>
  );
}

export type DrawerCommands = {
  onPayDeposit: (order: BuyerPreOrder) => void;
  onCancel: (order: BuyerPreOrder) => void;
  onReport: (order: BuyerPreOrder) => void;
  onConfirmArrival: (order: BuyerPreOrder) => void;
  onProposeCancel: (order: BuyerPreOrder) => void;
};

type BodyProps = { order: BuyerPreOrder; userId: string | null; busy: boolean } & DrawerHandlers & DrawerCommands;

function ConsiderationBlock({ order, busy, onProposeCancel }: { order: BuyerPreOrder; busy: boolean; onProposeCancel: (order: BuyerPreOrder) => void }) {
  if (!canProposeCancel(order)) return null;
  return (
    <section className={styles.block}>
      <h3 className={styles.blockTitle}>Hủy đơn đã đặt cọc</h3>
      <p className={styles.note}>Đơn đã đặt cọc chỉ hủy được khi nông dân đồng ý.</p>
      <div className={styles.actions}>
        <Button variant="ghost" disabled={busy} onClick={() => onProposeCancel(order)}>Đề nghị hủy đơn</Button>
      </div>
    </section>
  );
}

function DrawerBody(props: BodyProps) {
  const { order, userId, busy, onProposeSettlement, onRated } = props;
  const status = getOrderStatusInfo(order);
  const agreement = pickAgreementForDisplay(order.agreements);
  const inHarvestWait = order.status === 'deposited' || order.status === 'awaiting_harvest';
  return (
    <div className={styles.body}>
      <header className={styles.header}>
        <h2 className={styles.title}>{order.batch.cropName}</h2>
        <StatusBadge label={status.label} tone={status.tone} />
      </header>
      {agreement && (
        <AgreementBanner agreement={agreement} viewerId={order.buyerId} proposerName={order.batch.farmer.name} unit={order.batch.unit} busy={props.agreementBusy} onRespond={props.onRespond} />
      )}
      <DrawerActions order={order} busy={busy} onPayDeposit={props.onPayDeposit} onCancel={props.onCancel} onReport={props.onReport} onConfirmArrival={props.onConfirmArrival} />
      <OrderTimeline status={order.status} />
      <MoneyBlock order={order} />
      {getOrderPrimaryAction(order) === 'propose_settlement' && (
        <section className={styles.block}>
          <h3 className={styles.blockTitle}>Xác nhận số lượng thực nhận</h3>
          <ProposeSettlementForm key={order.id} order={order} busy={props.agreementBusy} onSubmit={(quantity) => onProposeSettlement(order, quantity)} />
        </section>
      )}
      <DeliveryBlock order={order} />
      {inHarvestWait && <HarvestProgressLog batchId={order.batch.id} />}
      <ContactBlock order={order} />
      <ConsiderationBlock order={order} busy={busy} onProposeCancel={props.onProposeCancel} />
      <section className={styles.block}>
        <h3 className={styles.blockTitle}>Lịch sử giao dịch</h3>
        <LedgerSection preOrderId={order.id} versionKey={`${order.status}-${order.deposits.length}`} />
      </section>
      {userId && <OrderMessageThread preOrderId={order.id} currentUserId={userId} />}
      {order.status === 'settled' && userId && (
        <RatingForm preOrderId={order.id} alreadyRated={order.ratings.some((rating) => rating.raterId === userId)} onSubmitted={onRated} />
      )}
    </div>
  );
}

export function OrderDrawer({ order, onClose, ...bodyProps }: { order: BuyerPreOrder | null; onClose: () => void } & Omit<BodyProps, 'order'>) {
  return (
    <Overlay open={order !== null} onClose={onClose} label="Chi tiết đơn hàng" variant="drawer">
      <div className={styles.close}>
        <Button variant="outline" onClick={onClose}>Đóng</Button>
      </div>
      {order && <DrawerBody key={order.id} order={order} {...bodyProps} />}
    </Overlay>
  );
}
