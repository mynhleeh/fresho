'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { preOrderStatusInfo } from '@/lib/orderStatus';
import styles from '../admin.module.css';

type PreOrder = { id: string; status: string; quantity: number; batch: { cropName: string }; buyer: { name: string } };

export default function AdminOrders() {
  const [orders, setOrders] = useState<PreOrder[]>([]);

  useEffect(() => {
    fetch('/api/admin/orders').then((r) => (r.ok ? r.json() : [])).then(setOrders);
  }, []);

  return (
    <AppShell role="admin">
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Tất cả đơn hàng</h1>
          <p className={styles.subheading}>Theo dõi giao dịch trên toàn nền tảng.</p>
        </div>
        <Card>
          <table className={styles.table}>
            <thead>
              <tr><th>Nông sản</th><th>Người mua</th><th>Số lượng</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const status = preOrderStatusInfo(o.status);
                return (
                  <tr key={o.id}>
                    <td>{o.batch.cropName}</td>
                    <td>{o.buyer.name}</td>
                    <td>{o.quantity}</td>
                    <td><StatusBadge label={status.label} tone={status.tone} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </AppShell>
  );
}
