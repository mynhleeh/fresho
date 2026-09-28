'use client';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../../components/feedback/StateBlock';
import { useApiDetail } from '../../../components/feedback/useApiDetail';
import { useCurrentUserId } from '../../../components/hooks/useCurrentUserId';
import { ButtonLink } from '../../../components/ui/ButtonLink';
import type { FarmerOrderDetail } from '../data/orderTypes';
import { OrderDetailContent } from './OrderDetailContent';

const POLL_MS = 15000;

function OrderNotFound() {
  return (
    <EmptyState
      title="Không tìm thấy đơn đặt trước"
      hint="Đơn này không tồn tại hoặc không thuộc mùa vụ của bạn."
      action={<ButtonLink href="/farmer/orders">Về danh sách đơn</ButtonLink>}
    />
  );
}

export function OrderDetailScreen({ orderId }: { orderId: string }) {
  const { state, reload } = useApiDetail<FarmerOrderDetail>(`/api/preorders/${orderId}`, POLL_MS);
  const userId = useCurrentUserId();

  if (state.status === 'loading' || (state.status === 'ready' && !userId)) return <LoadingSkeleton />;
  if (state.status === 'error') return state.missing ? <OrderNotFound /> : <ErrorState message={state.message} onRetry={reload} />;
  if (!userId || state.data.batch.farmerId !== userId) return <OrderNotFound />;
  return <OrderDetailContent order={state.data} userId={userId} reload={reload} />;
}
