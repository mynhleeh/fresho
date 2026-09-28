import { HarvestProgressLog } from '../../../components/order-thread/HarvestProgressLog';
import { OrderMessageThread } from '../../../components/order-thread/OrderMessageThread';
import { RatingForm } from '../../../components/order-thread/RatingForm';
import { DetailBlock } from '../../../components/order/DetailBlock';
import { LedgerHistory } from '../../../components/order/LedgerHistory';
import { OrderTimeline } from '../../../components/order/OrderTimeline';
import { ActionGroup } from '../../../components/ui/ActionGroup';
import { Button } from '../../../components/ui/Button';
import { AgreementPanel, type AgreementResponder } from './AgreementPanel';
import { canProposeCancel } from '../data/orderActionCopy';
import type { FarmerOrderDetail } from '../data/orderTypes';
import { BuyerContactSection, DisputesSection, ShippingSection } from './FulfilmentSections';
import { HarvestProgressActions } from './HarvestProgressActions';
import { OrderHeaderBand } from './OrderHeaderBand';
import { OrderNumbersStrip } from './OrderNumbersStrip';

const HARVEST_UPDATE_STATUSES = ['deposited', 'awaiting_harvest'];
const PROGRESS_POLL_MS = 15000;

type Props = {
  order: FarmerOrderDetail;
  userId: string;
  agreementBusy: boolean;
  onRespond: AgreementResponder;
  onProposeCancel: () => void;
  showToast: (tone: 'success' | 'error', text: string) => void;
  onChanged: () => void;
};

function HarvestSections({ order, showToast, onChanged }: Pick<Props, 'order' | 'showToast' | 'onChanged'>) {
  return (
    <>
      <HarvestProgressActions batchId={order.batchId} quantityTotal={order.batch.quantityTotal} showToast={showToast} onDone={onChanged} />
      <HarvestProgressLog batchId={order.batchId} pollMs={PROGRESS_POLL_MS} />
    </>
  );
}

function CancelSection({ agreementBusy, onProposeCancel }: Pick<Props, 'agreementBusy' | 'onProposeCancel'>) {
  return (
    <DetailBlock title="Hủy đơn đã đặt cọc" eyebrow="Khi không thể giao" tone="tint">
      <p>Nếu không thể giao hàng, bạn có thể đề nghị hủy đơn. Đơn chỉ hủy khi người mua đồng ý.</p>
      <ActionGroup>
        <Button variant="outline" disabled={agreementBusy} onClick={onProposeCancel}>Đề nghị hủy đơn</Button>
      </ActionGroup>
    </DetailBlock>
  );
}

export function OrderMainSections({ order, userId, agreementBusy, onRespond, onProposeCancel, showToast, onChanged }: Props) {
  const alreadyRated = order.ratings.some((rating) => rating.raterId === userId);
  return (
    <>
      <OrderHeaderBand order={order} />
      <AgreementPanel order={order} viewerId={userId} busy={agreementBusy} onRespond={onRespond} />
      <OrderNumbersStrip order={order} />
      <DetailBlock title="Tiến trình đơn" eyebrow="Hành trình" tone="tint"><OrderTimeline status={order.status} /></DetailBlock>
      {HARVEST_UPDATE_STATUSES.includes(order.status) && <HarvestSections order={order} showToast={showToast} onChanged={onChanged} />}
      <ShippingSection order={order} />
      <DisputesSection order={order} />
      <DetailBlock title="Lịch sử giao dịch" eyebrow="Sổ cái" tone="tint"><LedgerHistory entries={order.ledgerEntries} /></DetailBlock>
      <BuyerContactSection order={order} />
      <DetailBlock title="Trao đổi với người mua" eyebrow="Tin nhắn" tone="kraft">
        <OrderMessageThread preOrderId={order.id} currentUserId={userId} initiallyOpen pollMs={PROGRESS_POLL_MS} />
      </DetailBlock>
      {canProposeCancel(order) && <CancelSection agreementBusy={agreementBusy} onProposeCancel={onProposeCancel} />}
      {order.status === 'settled' && (
        <DetailBlock title="Đánh giá người mua" eyebrow="Sau giao dịch" tone="tint">
          <RatingForm preOrderId={order.id} alreadyRated={alreadyRated} onSubmitted={onChanged} />
        </DetailBlock>
      )}
    </>
  );
}
