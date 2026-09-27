'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderMessageThread } from '../../components/OrderMessageThread';
import { HarvestProgressLog } from '../../components/HarvestProgressLog';
import { formatVnd } from '../../components/MoneySummaryRow';
import { preOrderStatusInfo } from '@/lib/orderStatus';
import styles from './page.module.css';

type PreOrder = { id: string; status: string; quantity: number; pricePerUnit: number; shippingFeeQuote: number | null; batch: { id: string; cropName: string } };

export default function BuyerOrders() {
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [shippingFees, setShippingFees] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/preorders/mine').then((r) => r.json()).then(setOrders);
    fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).then((u) => setUserId(u?.id ?? null));
  }, []);

  async function confirmReceipt(o: PreOrder) {
    const shippingFee = shippingFees[o.id] ?? 0;
    await fetch(`/api/preorders/${o.id}/confirm-receipt`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalQuantity: o.quantity, shippingFee }),
    });
    location.reload();
  }

  return (
    <AppShell role="buyer">
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Đơn hàng của tôi</h1>
          <p className={styles.subheading}>Theo dõi trạng thái và hoàn tất giao dịch.</p>
        </div>

        <div className={styles.orderList}>
          {orders.length === 0 && <Card className={styles.empty}>Chưa có đơn đặt trước nào.</Card>}
          {orders.map((o) => {
            const status = preOrderStatusInfo(o.status);
            return (
              <Card key={o.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <div className={styles.orderTitle}>{o.batch.cropName}</div>
                    <div className={styles.orderMeta}>
                      {o.quantity} kg · Tiền hàng {formatVnd(o.quantity * o.pricePerUnit)}
                      {o.shippingFeeQuote != null && <> · Cước dự kiến {formatVnd(o.shippingFeeQuote)}</>}
                    </div>
                  </div>
                  <StatusBadge label={status.label} tone={status.tone} />
                </div>
                {(o.status === 'deposited' || o.status === 'awaiting_harvest') && (
                  <HarvestProgressLog batchId={o.batch.id} />
                )}
                {userId && <OrderMessageThread preOrderId={o.id} currentUserId={userId} />}
                {o.status === 'delivered' && (
                  <div className={styles.settleRow}>
                    <label htmlFor={`fee-${o.id}`}>Cước vận chuyển thực tế</label>
                    <input
                      id={`fee-${o.id}`}
                      type="number"
                      min={0}
                      defaultValue={0}
                      onChange={(e) => setShippingFees({ ...shippingFees, [o.id]: Number(e.target.value) })}
                    />
                    <Button onClick={() => confirmReceipt(o)}>Xác nhận nhận hàng & thanh toán</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
