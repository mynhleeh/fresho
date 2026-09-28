'use client';
import { use } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { PageFrame } from '../../../components/layout/PageFrame';
import { ButtonLink } from '../../../components/ui/ButtonLink';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../../components/feedback/StateBlock';
import { Toast, useToast } from '../../../components/feedback/Toast';
import { useApiDetail } from '../../../components/feedback/useApiDetail';
import { useCurrentUserId } from '../../../components/hooks/useCurrentUserId';
import type { BuyerOrderDetail } from '../data/orderView';
import { useOrderFlow } from '../data/useOrderFlow';
import { BuyerOrderDetailView } from '../detail/BuyerOrderDetailView';
import { OrderFlowDialogs } from '../detail/OrderFlowDialogs';

const POLL_MS = 15000;

function OrderNotFound() {
  return (
    <EmptyState
      title="Không tìm thấy đơn hàng này"
      hint="Đơn có thể không tồn tại hoặc không thuộc về bạn."
      action={<ButtonLink href="/buyer/orders">Về danh sách đơn hàng</ButtonLink>}
    />
  );
}

export default function BuyerOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { state, reload } = useApiDetail<BuyerOrderDetail>(`/api/preorders/${orderId}`, POLL_MS);
  const { message, showToast, dismissToast } = useToast();
  const flow = useOrderFlow(reload, showToast);
  const userId = useCurrentUserId();
  const notOwner = state.status === 'ready' && userId !== null && state.data.buyerId !== userId;

  function announceRated() {
    showToast('success', 'Đã gửi đánh giá nông dân.');
    reload();
  }

  return (
    <AppShell role="buyer">
      <PageFrame roomy>
        {(state.status === 'loading' || (state.status === 'ready' && userId === null)) && <LoadingSkeleton />}
        {state.status === 'error' && (state.missing ? <OrderNotFound /> : <ErrorState message={state.message} onRetry={reload} />)}
        {notOwner && <OrderNotFound />}
        {state.status === 'ready' && userId !== null && !notOwner && (
          <BuyerOrderDetailView order={state.data} userId={userId} flow={flow} onRated={announceRated} />
        )}
        <OrderFlowDialogs flow={flow} />
        <Toast message={message} onDismiss={dismissToast} />
      </PageFrame>
    </AppShell>
  );
}
