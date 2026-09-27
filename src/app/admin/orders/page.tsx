'use client';
import { useEffect, useState } from 'react';

type PreOrder = { id: string; status: string; quantity: number; batch: { cropName: string }; buyer: { name: string } };

export default function AdminOrders() {
  const [orders, setOrders] = useState<PreOrder[]>([]);

  useEffect(() => {
    fetch('/api/admin/orders').then((r) => r.json()).then(setOrders);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Tat ca don hang</h1>
      <table>
        <thead><tr><th>Batch</th><th>Buyer</th><th>SL</th><th>Trang thai</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}><td>{o.batch.cropName}</td><td>{o.buyer.name}</td><td>{o.quantity}</td><td>{o.status}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
