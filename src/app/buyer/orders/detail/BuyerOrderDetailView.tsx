'use client';
import { pickAgreementForDisplay } from '@/lib/order/orderWorkflow';
import { useScrollToHash } from '../../../components/hooks/useScrollToHash';
import { OrderDetailLayout } from '../../../components/order/OrderDetailLayout';
import { OrderTimeline } from '../../../components/order/OrderTimeline';
import { LedgerHistory } from '../../../components/order/LedgerHistory';
import { DetailBlock } from '../../../components/order/DetailBlock';
import { AgreementBanner } from '../../../components/agreement/AgreementBanner';
import { HarvestProgressLog } from '../../../components/order-thread/HarvestProgressLog';
import { OrderMessageThread } from '../../../components/order-thread/OrderMessageThread';
import { RatingForm } from '../../../components/order-thread/RatingForm';
import { getOrderPrimaryAction, type BuyerOrderDetail } from '../data/orderView';
import type { OrderFlow } from '../data/useOrderFlow';
import { hasPrimaryAction, PrimaryActionGroup } from './OrderActions';
import { MoneyStrip } from './MoneyPanels';
import { OrderHeader } from './OrderHeader';
import { ContactBlock, DeliveryBlock, DisputeList, ProposeCancelBlock } from './OrderInfoBlocks';
import { OrderSummary } from './OrderSummary';
import { ProposeSettlementForm } from './ProposeSettlementForm';
import styles from './BuyerOrderDetailView.module.css';

const POLL_MS = 15000;

type ViewProps = { order: BuyerOrderDetail; userId: string; flow: OrderFlow; onRated: () => void };

function SettlementPanel({ order, flow }: { order: BuyerOrderDetail; flow: OrderFlow }) {
  if (getOrderPrimaryAction(order) !== 'propose_settlement') return null;
  return (
    <div id="settlement-form" className={styles.anchor}>
      <DetailBlock title="Xác nhận số lượng thực nhận" eyebrow="Đối soát" tone="kraft">
        <ProposeSettlementForm key={order.id} order={order} busy={flow.agreementBusy} onSubmit={(quantity) => flow.proposeSettlement(order.id, quantity)} />
      </DetailBlock>
    </div>
  );
}

function AgreementSection({ order, flow }: { order: BuyerOrderDetail; flow: OrderFlow }) {
  const agreement = pickAgreementForDisplay(order.agreements);
  if (!agreement) return null;
  return (
    <AgreementBanner agreement={agreement} viewerId={order.buyerId} proposerName={order.batch.farmer.name} unit={order.batch.unit} busy={flow.agreementBusy} onRespond={flow.respond} />
  );
}

function HarvestWait({ order }: { order: BuyerOrderDetail }) {
  const inHarvestWait = order.status === 'deposited' || order.status === 'awaiting_harvest';
  return inHarvestWait ? <HarvestProgressLog batchId={order.batch.id} pollMs={POLL_MS} /> : null;
}

function RatingSection({ order, userId, onRated }: Omit<ViewProps, 'flow'>) {
  if (order.status !== 'settled') return null;
  const alreadyRated = order.ratings.some((rating) => rating.raterId === userId);
  return (
    <div id="rating-form" className={styles.anchor}>
      <DetailBlock title="Đánh giá nông dân" eyebrow="Sau giao hàng" tone="tint">
        <RatingForm preOrderId={order.id} alreadyRated={alreadyRated} onSubmitted={onRated} />
      </DetailBlock>
    </div>
  );
}

export function BuyerOrderDetailView({ order, userId, flow, onRated }: ViewProps) {
  useScrollToHash();
  const alreadyRated = order.ratings.some((rating) => rating.raterId === userId);
  const mobileActions = hasPrimaryAction(order, alreadyRated) ? <PrimaryActionGroup order={order} alreadyRated={alreadyRated} flow={flow} /> : undefined;
  return (
    <OrderDetailLayout
      listHref="/buyer/orders"
      listLabel="Đơn hàng của tôi"
      title={order.batch.cropName}
      summary={<OrderSummary order={order} alreadyRated={alreadyRated} flow={flow} />}
      mobileActions={mobileActions}
    >
      <OrderHeader order={order} alreadyRated={alreadyRated} />
      <AgreementSection order={order} flow={flow} />
      <MoneyStrip order={order} />
      <SettlementPanel order={order} flow={flow} />
      <DetailBlock title="Hành trình đơn hàng" eyebrow="Từng chặng"><OrderTimeline status={order.status} /></DetailBlock>
      <div className={styles.pair}>
        <DeliveryBlock order={order} />
        <ContactBlock order={order} />
      </div>
      <HarvestWait order={order} />
      <DisputeList disputes={order.disputes} />
      <ProposeCancelBlock order={order} flow={flow} />
      <DetailBlock title="Lịch sử giao dịch" eyebrow="Sổ tiền" tone="kraft"><LedgerHistory entries={order.ledgerEntries} /></DetailBlock>
      <DetailBlock title="Trao đổi với nông dân" tone="plain">
        <OrderMessageThread preOrderId={order.id} currentUserId={userId} initiallyOpen pollMs={POLL_MS} />
      </DetailBlock>
      <RatingSection order={order} userId={userId} onRated={onRated} />
    </OrderDetailLayout>
  );
}
