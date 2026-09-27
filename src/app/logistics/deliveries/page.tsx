'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { preOrderStatusInfo } from '@/lib/orderStatus';
import styles from './page.module.css';

type Delivery = { preOrderId: string; status: string; preOrder: { batch: { cropName: string }; buyer: { name: string } } };

export default function LogisticsDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  async function load() {
    const res = await fetch('/api/deliveries/mine');
    setDeliveries(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function update(preOrderId: string, status: 'in_transit' | 'delivered') {
    await fetch(`/api/deliveries/${preOrderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
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
                {d.status === 'in_transit' && <Button onClick={() => update(d.preOrderId, 'delivered')}>Đã giao</Button>}
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
