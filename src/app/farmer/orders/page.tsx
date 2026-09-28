'use client';
import { useCallback, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { Toast, useToast } from '../../components/feedback/Toast';
import { useCloseWhenMissing } from '../../components/hooks/useCloseWhenMissing';
import { useCurrentUserId } from '../../components/hooks/useCurrentUserId';
import { useApiList } from '../../components/feedback/useApiList';
import { CancelProposalDialog } from '../../components/agreement/CancelProposalDialog';
import { useAgreementActions } from '../../components/agreement/useAgreementActions';
import { OrderDrawer } from './drawer/OrderDrawer';
import { OrderFilterTabs, type OrderFilter } from './list/OrderFilterTabs';
import { OrderSections } from './list/OrderSections';
import { OrderSummary } from './summary/OrderSummary';
import { CONFIRM_COPY, type ActionKind } from './data/orderActionCopy';
import { countByGroup, moneyOf, sumExpected, type FarmerPreOrder } from './data/orderTypes';
import { useOrderActions } from './data/useOrderActions';
import styles from './page.module.css';

const POLL_MS = 15000;

type PendingAction = { order: FarmerPreOrder; kind: ActionKind };

export default function FarmerOrders() {
  const { state, reload } = useApiList<FarmerPreOrder>('/api/preorders/for-farmer', 0, POLL_MS);
  const { message, showToast, dismissToast } = useToast();
  const { busy, run } = useOrderActions(showToast, reload);
  const agreements = useAgreementActions(showToast, reload);
  const userId = useCurrentUserId();
  const [cancelTarget, setCancelTarget] = useState<FarmerPreOrder | null>(null);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const orders = state.status === 'ready' ? state.items : [];
  const openOrder = orders.find((order) => order.id === openId) ?? null;
  const closeMissingOrder = useCallback(() => {
    setOpenId(null);
    showToast('error', 'Đơn này không còn trong danh sách của bạn. Hãy tải lại trang nếu cần.');
  }, [showToast]);
  useCloseWhenMissing(openId, state.status !== 'ready' || openOrder !== null, closeMissingOrder);

  const requestAction = useCallback((order: FarmerPreOrder, kind: ActionKind) => {
    if (CONFIRM_COPY[kind]) setPending({ order, kind });
    else run(order, kind);
  }, [run]);

  async function runPending() {
    if (!pending) return;
    const { order, kind } = pending;
    const done = await run(order, kind);
    setPending(null);
    if (done && kind === 'reject') setOpenId(null);
  }

  async function submitCancelProposal(refundAmount: number) {
    if (!cancelTarget) return;
    const sent = await agreements.proposeCancel(cancelTarget.id, refundAmount);
    if (sent) setCancelTarget(null);
  }

  return (
    <AppShell role="farmer">
      <PageFrame>
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
          <div className={styles.stack}>
            <OrderSummary counts={countByGroup(orders)} expectedTotal={sumExpected(orders)} />
            <OrderFilterTabs active={filter} counts={countByGroup(orders)} total={orders.length} onChange={setFilter} />
            <OrderSections orders={orders} filter={filter} busy={busy} viewerId={userId} agreementBusy={agreements.busy} onRespond={agreements.respond} onOpen={(order) => setOpenId(order.id)} onAct={requestAction} />
          </div>
        )}
        {openOrder && (
          <OrderDrawer
            order={openOrder}
            userId={userId}
            busy={busy}
            agreementBusy={agreements.busy}
            onRespond={agreements.respond}
            onProposeCancel={setCancelTarget}
            showToast={showToast}
            onAct={requestAction}
            onChanged={reload}
            onClose={() => setOpenId(null)}
          />
        )}
        {pending && CONFIRM_COPY[pending.kind] && (
          <ConfirmDialog open {...CONFIRM_COPY[pending.kind]!} loading={busy} onConfirm={runPending} onCancel={() => setPending(null)} />
        )}
        <CancelProposalDialog
          open={cancelTarget !== null}
          depositTotal={cancelTarget ? moneyOf(cancelTarget).deposit : 0}
          busy={agreements.busy}
          onSubmit={submitCancelProposal}
          onClose={() => setCancelTarget(null)}
        />
        <Toast message={message} onDismiss={dismissToast} />
      </PageFrame>
    </AppShell>
  );
}
