'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderMessageThread } from '../../components/OrderMessageThread';
import { RatingForm } from '../../components/RatingForm';
import { formatVnd } from '../../components/MoneySummaryRow';
import { preOrderStatusInfo } from '@/lib/orderStatus';
import styles from './page.module.css';

type PreOrder = { id: string; status: string; quantity: number; pricePerUnit: number; batch: { cropName: string }; buyer: { name: string }; ratings: { raterId: string }[] };

export default function FarmerOrders() {
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/preorders/for-farmer');
    setOrders(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
    load();
    fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)).then((u) => setUserId(u?.id ?? null));
  }, []);

  async function act(id: string, action: 'confirm' | 'reject' | 'negotiate') {
    await fetch(`/api/preorders/${id}/${action}`, { method: 'PATCH' });
    load();
  }

  async function markDelivered(id: string) {
    await fetch(`/api/deliveries/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered' }),
    });
    load();
  }

  return (
    <AppShell role="farmer">
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Đơn đặt trước</h1>
          <p className={styles.subheading}>Xác nhận đơn hàng và cập nhật tiến độ mùa vụ.</p>
        </div>

        <div className={styles.orderList}>
          {orders.length === 0 && <Card className={styles.empty}>Chưa có đơn đặt trước nào.</Card>}
          {orders.map((o) => {
            const status = preOrderStatusInfo(o.status);
            return (
              <Card key={o.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <div className={styles.orderTitle}>{o.batch.cropName} — {o.buyer.name}</div>
                    <div className={styles.orderMeta}>
                      {o.quantity} kg · {formatVnd(o.quantity * o.pricePerUnit)}
                    </div>
                  </div>
                  <StatusBadge label={status.label} tone={status.tone} />
                </div>
                {userId && <OrderMessageThread preOrderId={o.id} currentUserId={userId} />}
                <div className={styles.orderActions}>
                  {(o.status === 'pending_confirmation' || o.status === 'negotiating') && (
                    <>
                      <Button onClick={() => act(o.id, 'confirm')}>Xác nhận đơn hàng</Button>
                      {o.status === 'pending_confirmation' && (
                        <Button variant="outline" onClick={() => act(o.id, 'negotiate')}>Trao đổi</Button>
                      )}
                      <Button variant="danger" onClick={() => act(o.id, 'reject')}>Từ chối</Button>
                    </>
                  )}
                  {o.status === 'ready_for_handover' && (
                    <Button onClick={() => markDelivered(o.id)}>Đã giao (tự lấy)</Button>
                  )}
                </div>
                {o.status === 'settled' && userId && (
                  <RatingForm
                    preOrderId={o.id}
                    alreadyRated={o.ratings.some((r) => r.raterId === userId)}
                    onSubmitted={load}
                  />
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
