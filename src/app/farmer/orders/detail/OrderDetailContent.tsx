'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CancelProposalDialog } from '../../../components/agreement/CancelProposalDialog';
import { useAgreementActions } from '../../../components/agreement/useAgreementActions';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { Toast, useToast } from '../../../components/feedback/Toast';
import { OrderDetailLayout } from '../../../components/order/OrderDetailLayout';
import { ActionGroup } from '../../../components/ui/ActionGroup';
import { Button } from '../../../components/ui/Button';
import { ACTION_LABEL, CONFIRM_COPY, PRIMARY_KIND } from '../data/orderActionCopy';
import { actionOf, moneyOf, type FarmerOrderDetail } from '../data/orderTypes';
import { useActionRequests } from '../data/useActionRequests';
import { useOrderActions } from '../data/useOrderActions';
import { OrderMainSections } from './OrderMainSections';
import { OrderSummaryAside } from './OrderSummaryAside';

type Props = { order: FarmerOrderDetail; userId: string; reload: () => void };

export function OrderDetailContent({ order, userId, reload }: Props) {
  const router = useRouter();
  const { message, showToast, dismissToast } = useToast();
  const { busy, run } = useOrderActions(showToast, reload);
  const agreements = useAgreementActions(showToast, reload);
  const backToList = useCallback(() => router.push('/farmer/orders'), [router]);
  const { pending, requestAction, confirmPending, dismissPending } = useActionRequests(run, backToList);
  const [cancelOpen, setCancelOpen] = useState(false);
  const primaryKind = PRIMARY_KIND[actionOf(order)];

  async function submitCancelProposal(refundAmount: number) {
    if (await agreements.proposeCancel(order.id, refundAmount)) setCancelOpen(false);
  }

  return (
    <>
      <OrderDetailLayout
        listHref="/farmer/orders"
        listLabel="Đơn đặt trước"
        title={order.batch.cropName}
        summary={<OrderSummaryAside order={order} busy={busy} onAct={requestAction} />}
        mobileActions={primaryKind && (
          <ActionGroup><Button disabled={busy} onClick={() => requestAction(order, primaryKind)}>{ACTION_LABEL[primaryKind]}</Button></ActionGroup>
        )}
      >
        <OrderMainSections order={order} userId={userId} agreementBusy={agreements.busy} onRespond={agreements.respond} onProposeCancel={() => setCancelOpen(true)} showToast={showToast} onChanged={reload} />
      </OrderDetailLayout>
      {pending && CONFIRM_COPY[pending.kind] && (
        <ConfirmDialog open {...CONFIRM_COPY[pending.kind]!} loading={busy} onConfirm={confirmPending} onCancel={dismissPending} />
      )}
      <CancelProposalDialog open={cancelOpen} depositTotal={moneyOf(order).deposit} busy={agreements.busy} onSubmit={submitCancelProposal} onClose={() => setCancelOpen(false)} />
      <Toast message={message} onDismiss={dismissToast} />
    </>
  );
}
