'use client';
import { AppShell } from '../../components/layout/AppShell';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { Toast, useToast } from '../../components/feedback/Toast';
import { useCurrentUserId } from '../../components/hooks/useCurrentUserId';
import { useRestoredScroll } from '../../components/hooks/useRestoredScroll';
import { useApiList } from '../../components/feedback/useApiList';
import { OrderCard, type CardVariant } from './card/OrderCard';
import { OrdersHero } from './hero/OrdersHero';
import { getOrderGroup, totalRemaining, type BuyerPreOrder } from './data/orderView';
import { useOrderFlow } from './data/useOrderFlow';
import { useSessionState } from './data/useSessionState';
import { OrderFlowDialogs } from './detail/OrderFlowDialogs';
import styles from './page.module.css';

const POLL_MS = 15000;

const PAGE_SIZE = 6;

type SectionProps = {
  title: string;
  hint: string;
  variant: CardVariant;
  orders: BuyerPreOrder[];
  render: (order: BuyerPreOrder) => React.ReactNode;
};

function OrderSection({ title, hint, variant, orders, render }: SectionProps) {
  const [visibleCount, setVisibleCount] = useSessionState(`buyer-orders-visible-${variant}`, PAGE_SIZE);
  if (orders.length === 0) return null;
  const hiddenCount = Math.max(0, orders.length - visibleCount);
  return (
    <section className={`${styles.section} ${variant === 'todo' ? styles.todo : ''}`}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <span className={styles.count}>{orders.length}</span>
      </div>
      <p className={styles.sectionHint}>{hint}</p>
      <div className={`${styles.list} ${styles[`${variant}List`]}`}>{orders.slice(0, visibleCount).map(render)}</div>
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
  const flow = useOrderFlow(reload, showToast);
  const userId = useCurrentUserId();
  const [historyOpen, setHistoryOpen] = useSessionState('buyer-orders-history-open', false);
  const saveScroll = useRestoredScroll('/buyer/orders', state.status === 'ready');

  const orders = state.status === 'ready' ? state.items : [];
  const todo = orders.filter((order) => getOrderGroup(order) === 'todo');
  const following = orders.filter((order) => getOrderGroup(order) === 'following');
  const history = orders.filter((order) => getOrderGroup(order) === 'history');

  function saveScrollOnLinkClick(event: React.MouseEvent) {
    if ((event.target as Element).closest('a')) saveScroll();
  }

  function renderCard(order: BuyerPreOrder, variant: CardVariant) {
    return (
      <OrderCard
        key={order.id}
        order={order}
        variant={variant}
        busy={flow.busy}
        alreadyRated={userId !== null && order.ratings.some((rating) => rating.raterId === userId)}
        onPayDeposit={flow.openDeposit}
        onConfirmArrival={flow.openArrival}
      />
    );
  }

  return (
    <AppShell role="buyer">
      <PageFrame roomy>
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
          <div onClick={saveScrollOnLinkClick}>
            <OrdersHero todoCount={todo.length} followingCount={following.length} remainingAmount={totalRemaining(orders)} />
            <OrderSection title="Việc cần làm" hint="Các đơn đang chờ bạn đặt cọc, xác nhận đã nhận hàng hoặc phản hồi đề xuất." variant="todo" orders={todo} render={(order) => renderCard(order, 'todo')} />
            <OrderSection title="Đang theo dõi" hint="Các đơn đang được nông dân hoặc đơn vị vận chuyển xử lý." variant="following" orders={following} render={(order) => renderCard(order, 'following')} />
            {history.length > 0 && (
              <section className={styles.section}>
                <Button variant="outline" aria-expanded={historyOpen} onClick={() => setHistoryOpen(!historyOpen)}>
                  {historyOpen ? 'Ẩn lịch sử' : `Xem lịch sử (${history.length})`}
                </Button>
                {historyOpen && <div className={`${styles.list} ${styles.historyList}`}>{history.map((order) => renderCard(order, 'history'))}</div>}
              </section>
            )}
          </div>
        )}
        <OrderFlowDialogs flow={flow} />
        <Toast message={message} onDismiss={dismissToast} />
      </PageFrame>
    </AppShell>
  );
}
