import { AgreementBanner, type AgreementView } from '../../../components/agreement/AgreementBanner';
import { pickAgreementForDisplay } from '@/lib/order/orderWorkflow';
import type { FarmerPreOrder } from '../data/orderTypes';

export type AgreementResponder = (agreement: AgreementView, decision: 'accept' | 'decline') => void;

type Props = {
  order: FarmerPreOrder;
  viewerId: string | null;
  busy: boolean;
  onRespond: AgreementResponder;
};

export function AgreementPanel({ order, viewerId, busy, onRespond }: Props) {
  const agreement = pickAgreementForDisplay(order.agreements);
  if (!agreement || !viewerId) return null;
  return (
    <AgreementBanner
      agreement={agreement}
      viewerId={viewerId}
      proposerName={order.buyer.name}
      unit={order.batch.unit ?? 'kg'}
      busy={busy}
      onRespond={onRespond}
    />
  );
}
