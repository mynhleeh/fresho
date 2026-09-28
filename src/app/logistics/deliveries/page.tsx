'use client';
import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { useApiList } from '../../components/feedback/useApiList';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import { preOrderStatusInfo } from '@/lib/order/orderStatus';
import styles from './page.module.css';

type Delivery = { preOrderId: string; status: string; preOrder: { quantity: number; batch: { cropName: string }; buyer: { name: string } } };
type HandoverInput = { actualQuantity: string; proofUrl: string };

function parseActualQuantity(raw: string, reservedQuantity: number) {
  const parsed = Number(raw);
  return raw.trim() === '' || !Number.isFinite(parsed) ? reservedQuantity : parsed;
}

export default function LogisticsDeliveries() {
  const { state, reload } = useApiList<Delivery>('/api/deliveries/mine');
  const [handoverInputs, setHandoverInputs] = useState<Record<string, HandoverInput>>({});
  const [confirming, setConfirming] = useState<Delivery | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // TODO(business-confirm): empty actual quantity falls back to the reserved quantity; confirm this default with logistics/settlement owners.
  function inputFor(preOrderId: string): HandoverInput {
    return handoverInputs[preOrderId] ?? { actualQuantity: '', proofUrl: '' };
  }

  function changeInput(preOrderId: string, patch: Partial<HandoverInput>) {
    setHandoverInputs({ ...handoverInputs, [preOrderId]: { ...inputFor(preOrderId), ...patch } });
  }

  async function updateStatus(preOrderId: string, body: Record<string, unknown>) {
    setPendingId(preOrderId);
    setActionError(null);
    const res = await fetch(`/api/deliveries/${preOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    setPendingId(null);
    if (!res || !res.ok) {
      setActionError(await readApiErrorMessage(res));
      return;
    }
    reload();
  }

  async function confirmDelivered() {
    if (!confirming) return;
    const input = inputFor(confirming.preOrderId);
    await updateStatus(confirming.preOrderId, {
      status: 'delivered',
      actualQuantity: parseActualQuantity(input.actualQuantity, confirming.preOrder.quantity),
      proofPhotoUrl: input.proofUrl || undefined,
    });
    setConfirming(null);
  }

  return (
    <AppShell role="logistics">
      <PageFrame>
        <PageHeader eyebrow="Vận chuyển" title="Đơn giao hàng của tôi" description="Theo dõi quá trình lấy hàng, vận chuyển và giao nhận." />
        {actionError && <p role="alert" className={styles.actionError}>{actionError}</p>}
        {state.status === 'loading' && <LoadingSkeleton />}
        {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}
        {state.status === 'ready' && state.items.length === 0 && (
          <EmptyState title="Chưa có đơn giao hàng nào" hint="Đơn sẽ hiện ở đây khi được giao cho bạn." />
        )}
        {state.status === 'ready' && state.items.length > 0 && (
          <div className={styles.list}>
            {state.items.map((delivery) => {
              const status = preOrderStatusInfo(delivery.status);
              const input = inputFor(delivery.preOrderId);
              return (
                <Card key={delivery.preOrderId} className={styles.row}>
                  <div>
                    <div className={styles.title}>{delivery.preOrder.batch.cropName}</div>
                    <div className={styles.meta}>{delivery.preOrder.buyer.name}</div>
                  </div>
                  <StatusBadge label={status.label} tone={status.tone} />
                  {delivery.status === 'ready_for_handover' && (
                    <Button
                      onClick={() => updateStatus(delivery.preOrderId, { status: 'in_transit' })}
                      loading={pendingId === delivery.preOrderId}
                    >
                      Bắt đầu vận chuyển
                    </Button>
                  )}
                  {delivery.status === 'in_transit' && (
                    <div className={styles.handoverPanel}>
                      <label className={styles.field}>
                        Số lượng thực nhận (đặt {delivery.preOrder.quantity.toLocaleString('vi-VN')})
                        <input
                          className={styles.input}
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          value={input.actualQuantity}
                          onChange={(e) => changeInput(delivery.preOrderId, { actualQuantity: e.target.value })}
                        />
                      </label>
                      <label className={styles.field}>
                        Đường dẫn ảnh bằng chứng bàn giao
                        <input
                          className={styles.input}
                          type="url"
                          value={input.proofUrl}
                          onChange={(e) => changeInput(delivery.preOrderId, { proofUrl: e.target.value })}
                        />
                      </label>
                      <Button onClick={() => setConfirming(delivery)}>Đã giao</Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        <ConfirmDialog
          open={confirming !== null}
          title="Xác nhận đã giao hàng?"
          description="Sau khi xác nhận, đơn chuyển sang trạng thái đã giao và không thể hoàn tác. Hãy kiểm tra lại số lượng thực nhận."
          confirmLabel="Xác nhận đã giao"
          loading={pendingId !== null}
          onConfirm={confirmDelivered}
          onCancel={() => setConfirming(null)}
        />
      </PageFrame>
    </AppShell>
  );
}
