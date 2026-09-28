'use client';
import { Suspense, type MouseEvent } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { Toast, useToast } from '../../components/feedback/Toast';
import { useApiList } from '../../components/feedback/useApiList';
import { useRestoredScroll } from '../../components/hooks/useRestoredScroll';
import { OrderFilterTabs } from './list/OrderFilterTabs';
import { OrderSections } from './list/OrderSections';
import { useOrderFilter } from './list/useOrderFilter';
import { OrderSummary } from './summary/OrderSummary';
import { CONFIRM_COPY } from './data/orderActionCopy';
import { countByGroup, sumExpected, type FarmerPreOrder } from './data/orderTypes';
import { useActionRequests } from './data/useActionRequests';
import { useOrderActions } from './data/useOrderActions';
import styles from './page.module.css';

const POLL_MS = 15000;
const LIST_HREF = '/farmer/orders';

function FarmerOrders() {
  const { state, reload } = useApiList<FarmerPreOrder>('/api/preorders/for-farmer', 0, POLL_MS);
  const { message, showToast, dismissToast } = useToast();
  const { busy, run } = useOrderActions(showToast, reload);
  const { pending, requestAction, confirmPending, dismissPending } = useActionRequests(run);
  const [filter, setFilter] = useOrderFilter();
  const saveScroll = useRestoredScroll(LIST_HREF, state.status === 'ready');

  const orders = state.status === 'ready' ? state.items : [];
  const rememberScrollOnNavigate = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a')) saveScroll();
  };

  return (
    <AppShell role="farmer">
      <PageFrame roomy>
        <PageHeader eyebrow="Nông dân" title="Đơn đặt trước" description="Xác nhận đơn hàng và cập nhật tiến độ mùa vụ." />
        {state.status === 'loading' && <LoadingSkeleton />}
        {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}
        {state.status === 'ready' && orders.length === 0 && (
          <EmptyState
            title="Chưa có đơn đặt trước nào"
            hint="Đăng mùa vụ sắp thu hoạch để người mua có thể đặt trước."
            action={<ButtonLink href="/farmer/batches">Đến mục Mùa vụ</ButtonLink>}
          />
        )}
        {state.status === 'ready' && orders.length > 0 && (
          <div className={styles.stack} onClick={rememberScrollOnNavigate}>
            <OrderSummary counts={countByGroup(orders)} expectedTotal={sumExpected(orders)} />
            <OrderFilterTabs active={filter} counts={countByGroup(orders)} total={orders.length} onChange={setFilter} />
            <OrderSections key={filter} orders={orders} filter={filter} busy={busy} onAct={requestAction} />
          </div>
        )}
        {pending && CONFIRM_COPY[pending.kind] && (
          <ConfirmDialog open {...CONFIRM_COPY[pending.kind]!} loading={busy} onConfirm={confirmPending} onCancel={dismissPending} />
        )}
        <Toast message={message} onDismiss={dismissToast} />
      </PageFrame>
    </AppShell>
  );
}

export default function FarmerOrdersPage() {
  return (
    <Suspense fallback={null}>
      <FarmerOrders />
    </Suspense>
  );
}
