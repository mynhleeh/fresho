'use client';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { useApiList } from '../../components/feedback/useApiList';
import { preOrderStatusInfo } from '@/lib/order/orderStatus';
import styles from '../admin.module.css';

type PreOrder = { id: string; status: string; quantity: number; batch: { cropName: string }; buyer: { name: string } };

export default function AdminOrders() {
  const { state, reload } = useApiList<PreOrder>('/api/admin/orders');

  return (
    <AppShell role="admin">
      <PageFrame>
        <PageHeader eyebrow="Quản trị" title="Tất cả đơn hàng" description="Theo dõi giao dịch trên toàn nền tảng." />
        {state.status === 'loading' && <LoadingSkeleton />}
        {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}
        {state.status === 'ready' && state.items.length === 0 && (
          <EmptyState title="Chưa có đơn đặt trước nào" hint="Đơn sẽ xuất hiện ở đây khi người mua đặt trước lô hàng." />
        )}
        {state.status === 'ready' && state.items.length > 0 && (
          <Card className={styles.tableCard}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>Danh sách đơn đặt trước</caption>
                <thead>
                  <tr><th scope="col">Nông sản</th><th scope="col">Người mua</th><th scope="col">Số lượng</th><th scope="col">Trạng thái</th></tr>
                </thead>
                <tbody>
                  {state.items.map((order) => {
                    const status = preOrderStatusInfo(order.status);
                    return (
                      <tr key={order.id}>
                        <td>{order.batch.cropName}</td>
                        <td>{order.buyer.name}</td>
                        <td>{order.quantity.toLocaleString('vi-VN')}</td>
                        <td><StatusBadge label={status.label} tone={status.tone} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </PageFrame>
    </AppShell>
  );
}
