'use client';
import { useCallback, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { Toast, useToast } from '../../components/feedback/Toast';
import { useCloseWhenMissing } from '../../components/hooks/useCloseWhenMissing';
import { useCurrentUserId } from '../../components/hooks/useCurrentUserId';
import { useApiList } from '../../components/feedback/useApiList';
import { OrderCard } from './card/OrderCard';
import { OrderDrawer } from './drawer/OrderDrawer';
import { OrdersHero } from './hero/OrdersHero';
import { ReportIssueDialog } from './drawer/ReportIssueDialog';
import { describeDepositCost, getOrderGroup, sumDeposits, totalRemaining, type BuyerPreOrder } from './data/orderView';
import { CancelProposalDialog } from '../../components/agreement/CancelProposalDialog';
import { useAgreementActions } from '../../components/agreement/useAgreementActions';
import { useOrderActions } from './data/useOrderActions';
import styles from './page.module.css';

const POLL_MS = 15000;

const PAGE_SIZE = 6;

function OrderSection({ title, hint, orders, render }: { title: string; hint: string; orders: BuyerPreOrder[]; render: (order: BuyerPreOrder) => React.ReactNode }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  if (orders.length === 0) return null;
  const hiddenCount = Math.max(0, orders.length - visibleCount);
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.count}>{orders.length}</span>
      </div>
      <p className={styles.sectionHint}>{hint}</p>
      <div className={styles.list}>{orders.slice(0, visibleCount).map(render)}</div>
      {hiddenCount > 0 && (
        <Button variant="outline" onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>
          Xem thêm {Math.min(hiddenCount, PAGE_SIZE)} đơn (còn {hiddenCount})
        </Button>
      )}
    </section>
  );
}

export default function BuyerOrders() {
  const { state, reload } = useApiList<BuyerPreOrder>('/api/preorders/mine', 0, POLL_MS);
  const { message, showToast, dismissToast } = useToast();
  const actions = useOrderActions(reload, showToast);
  const agreementActions = useAgreementActions(showToast, reload);
  const userId = useCurrentUserId();
  const [openId, setOpenId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BuyerPreOrder | null>(null);
  const [depositTarget, setDepositTarget] = useState<BuyerPreOrder | null>(null);
  const [arrivalTarget, setArrivalTarget] = useState<BuyerPreOrder | null>(null);
  const [cancelProposalTarget, setCancelProposalTarget] = useState<BuyerPreOrder | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const orders = state.status === 'ready' ? state.items : [];
  const todo = orders.filter((order) => getOrderGroup(order) === 'todo');
  const following = orders.filter((order) => getOrderGroup(order) === 'following');
  const history = orders.filter((order) => getOrderGroup(order) === 'history');
  const openOrder = orders.find((order) => order.id === openId) ?? null;
  const closeMissingOrder = useCallback(() => {
    setOpenId(null);
    showToast('error', 'Đơn này không còn trong danh sách của bạn. Hãy tải lại trang nếu cần.');
  }, [showToast]);
  useCloseWhenMissing(openId, state.status !== 'ready' || openOrder !== null, closeMissingOrder);

  async function confirmCancel() {
    if (!cancelTarget) return;
    const cancelled = await actions.cancelOrder(cancelTarget);
    setCancelTarget(null);
    if (cancelled) setOpenId(null);
  }

  async function confirmDeposit() {
    if (!depositTarget) return;
    await actions.payDeposit(depositTarget);
    setDepositTarget(null);
  }

  async function confirmArrival() {
    if (!arrivalTarget) return;
    await actions.confirmArrival(arrivalTarget);
    setArrivalTarget(null);
  }

  async function submitCancelProposal(refundAmount: number) {
    if (!cancelProposalTarget) return;
    const sent = await agreementActions.proposeCancel(cancelProposalTarget.id, refundAmount);
    if (sent) setCancelProposalTarget(null);
  }

  function renderCard(order: BuyerPreOrder, featured: boolean) {
    return (
    <OrderCard
      key={order.id}
      order={order}
      featured={featured}
      busy={actions.busy}
      agreementBusy={agreementActions.busy}
      alreadyRated={userId !== null && order.ratings.some((rating) => rating.raterId === userId)}
      onOpen={(target) => setOpenId(target.id)}
      onPayDeposit={setDepositTarget}
      onCancel={setCancelTarget}
      onReport={(target) => setReportId(target.id)}
      onConfirmArrival={setArrivalTarget}
      onRespond={agreementActions.respond}
    />
    );
  }

  return (
    <AppShell role="buyer">
      <PageFrame>
        <PageHeader eyebrow="Người mua" title="Đơn hàng của tôi" description="Theo dõi từng chuyến hàng từ vườn đến bếp và hoàn tất thanh toán." />
        {state.status === 'loading' && <LoadingSkeleton />}
        {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}
        {state.status === 'ready' && orders.length === 0 && (
          <EmptyState
            title="Bạn chưa có đơn đặt trước nào"
            hint="Chọn lô nông sản sắp thu hoạch và đặt trước để giữ hàng."
            action={<ButtonLink href="/buyer/marketplace">Tìm nông sản</ButtonLink>}
          />
        )}
        {state.status === 'ready' && orders.length > 0 && (
          <>
            <OrdersHero todoCount={todo.length} followingCount={following.length} remainingAmount={totalRemaining(orders)} />
            <OrderSection title="Việc cần làm" hint="Các đơn đang chờ bạn đặt cọc, xác nhận đã nhận hàng hoặc phản hồi đề xuất." orders={todo} render={(order) => renderCard(order, true)} />
            <OrderSection title="Đang theo dõi" hint="Các đơn đang được nông dân hoặc đơn vị vận chuyển xử lý." orders={following} render={(order) => renderCard(order, false)} />
            {history.length > 0 && (
              <section className={styles.section}>
                <Button variant="outline" aria-expanded={historyOpen} onClick={() => setHistoryOpen(!historyOpen)}>
                  {historyOpen ? 'Ẩn lịch sử' : `Xem lịch sử (${history.length})`}
                </Button>
                {historyOpen && <div className={styles.list}>{history.map((order) => renderCard(order, false))}</div>}
              </section>
            )}
          </>
        )}
        <OrderDrawer
          order={openOrder}
          userId={userId}
          busy={actions.busy}
          onClose={() => setOpenId(null)}
          onPayDeposit={setDepositTarget}
          onCancel={setCancelTarget}
          onReport={(target) => setReportId(target.id)}
          agreementBusy={agreementActions.busy}
          onConfirmArrival={setArrivalTarget}
          onProposeCancel={setCancelProposalTarget}
          onProposeSettlement={(target, quantity) => agreementActions.proposeSettlement(target.id, quantity)}
          onRespond={agreementActions.respond}
          onRated={() => { showToast('success', 'Đã gửi đánh giá nông dân.'); reload(); }}
        />
        <ConfirmDialog
          open={depositTarget !== null}
          title="Xác nhận đặt cọc"
          description={depositTarget ? describeDepositCost(depositTarget) : ''}
          confirmLabel="Đặt cọc"
          loading={actions.busy}
          onConfirm={confirmDeposit}
          onCancel={() => setDepositTarget(null)}
        />
        <ConfirmDialog
          open={arrivalTarget !== null}
          title="Xác nhận đã nhận hàng?"
          description="Hãy chắc chắn hàng đã đến tay bạn. Bước tiếp theo bạn sẽ nhập số lượng thực nhận để nông dân xác nhận."
          confirmLabel="Đã nhận hàng"
          loading={actions.busy}
          onConfirm={confirmArrival}
          onCancel={() => setArrivalTarget(null)}
        />
        <CancelProposalDialog
          key={cancelProposalTarget?.id ?? 'cancel-proposal-closed'}
          open={cancelProposalTarget !== null}
          depositTotal={cancelProposalTarget ? sumDeposits(cancelProposalTarget) : 0}
          busy={agreementActions.busy}
          onSubmit={submitCancelProposal}
          onClose={() => setCancelProposalTarget(null)}
        />
        <ConfirmDialog
          open={cancelTarget !== null}
          danger
          title="Hủy đơn hàng này?"
          description="Đơn sẽ dừng lại và không thể khôi phục. Đơn chưa có tiền cọc nên bạn không mất khoản nào."
          confirmLabel="Hủy đơn"
          loading={actions.busy}
          onConfirm={confirmCancel}
          onCancel={() => setCancelTarget(null)}
        />
        <ReportIssueDialog
          key={reportId ?? 'report-closed'}
          preOrderId={reportId}
          onClose={() => setReportId(null)}
          onReported={() => { setReportId(null); showToast('success', 'Đã gửi báo cáo vấn đề, đội ngũ hỗ trợ sẽ xử lý.'); reload(); }}
        />
        <Toast message={message} onDismiss={dismissToast} />
      </PageFrame>
    </AppShell>
  );
}
