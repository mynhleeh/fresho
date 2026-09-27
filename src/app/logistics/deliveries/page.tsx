'use client';
import { useEffect, useState } from 'react';

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
    <main style={{ padding: 24 }}>
      <h1>Giao hang duoc giao</h1>
      <ul>
        {deliveries.map((d) => (
          <li key={d.preOrderId}>
            {d.preOrder.batch.cropName} — {d.preOrder.buyer.name} — {d.status}
            {d.status === 'ready_for_handover' && <button onClick={() => update(d.preOrderId, 'in_transit')}>Bat dau van chuyen</button>}
            {d.status === 'in_transit' && <button onClick={() => update(d.preOrderId, 'delivered')}>Da giao</button>}
          </li>
        ))}
      </ul>
    </main>
  );
}
