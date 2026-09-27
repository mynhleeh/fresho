'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { preOrderStatusInfo } from '@/lib/orderStatus';
import styles from './page.module.css';

type Delivery = { preOrderId: string; status: string; preOrder: { quantity: number; batch: { cropName: string }; buyer: { name: string } } };

export default function LogisticsDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [actualQuantities, setActualQuantities] = useState<Record<string, number>>({});
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch('/api/deliveries/mine');
    if (!res.ok) return;
    setDeliveries(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function update(preOrderId: string, status: 'in_transit' | 'delivered', reservedQuantity?: number) {
    const body: Record<string, unknown> = { status };
    if (status === 'delivered') {
      body.actualQuantity = actualQuantities[preOrderId] ?? reservedQuantity;
      body.proofPhotoUrl = proofUrls[preOrderId] || undefined;
    }
    await fetch(`/api/deliveries/${preOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    load();
  }

  return (
    <AppShell role="logistics">
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Giao hàng được giao</h1>
          <p className={styles.subheading}>Theo dõi quá trình lấy hàng, vận chuyển và giao nhận.</p>
        </div>

        <div className={styles.list}>
          {deliveries.length === 0 && <Card className={styles.empty}>Chưa có đơn giao hàng nào.</Card>}
          {deliveries.map((d) => {
            const status = preOrderStatusInfo(d.status);
            return (
              <Card key={d.preOrderId} className={styles.row}>
                <div>
                  <div className={styles.title}>{d.preOrder.batch.cropName}</div>
                  <div className={styles.meta}>{d.preOrder.buyer.name}</div>
                </div>
                <StatusBadge label={status.label} tone={status.tone} />
                {d.status === 'ready_for_handover' && <Button onClick={() => update(d.preOrderId, 'in_transit')}>Bắt đầu vận chuyển</Button>}
                {d.status === 'in_transit' && (
                  <div className={styles.handoverPanel}>
                    <input
                      type="number"
                      placeholder={`Số lượng thực nhận (đặt ${d.preOrder.quantity})`}
                      onChange={(e) => setActualQuantities({ ...actualQuantities, [d.preOrderId]: Number(e.target.value) })}
                    />
                    <input
                      type="text"
                      placeholder="URL ảnh bằng chứng bàn giao"
                      onChange={(e) => setProofUrls({ ...proofUrls, [d.preOrderId]: e.target.value })}
                    />
                    <Button onClick={() => update(d.preOrderId, 'delivered', d.preOrder.quantity)}>Đã giao</Button>
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
