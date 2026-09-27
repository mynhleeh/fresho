'use client';
import { useEffect, useState } from 'react';

type PreOrder = { id: string; status: string; quantity: number; batch: { cropName: string }; buyer: { name: string } };

export default function FarmerOrders() {
  const [orders, setOrders] = useState<PreOrder[]>([]);

  async function load() {
    const res = await fetch('/api/preorders/for-farmer');
    setOrders(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function act(id: string, action: 'confirm' | 'reject') {
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
    <main style={{ padding: 24 }}>
      <h1>Don hang den</h1>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            {o.batch.cropName} — {o.buyer.name} — {o.quantity} — {o.status}
            {o.status === 'pending_confirmation' && (
              <>
                <button onClick={() => act(o.id, 'confirm')}>Xac nhan</button>
                <button onClick={() => act(o.id, 'reject')}>Tu choi</button>
              </>
            )}
            {o.status === 'ready_for_handover' && (
              <button onClick={() => markDelivered(o.id)}>Da giao (tu lay)</button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
