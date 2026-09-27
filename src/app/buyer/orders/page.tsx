'use client';
import { useEffect, useState } from 'react';

type PreOrder = { id: string; status: string; quantity: number; pricePerUnit: number; batch: { cropName: string } };

export default function BuyerOrders() {
  const [orders, setOrders] = useState<PreOrder[]>([]);

  useEffect(() => {
    fetch('/api/preorders/mine').then((r) => r.json()).then(setOrders);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Don hang cua toi</h1>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            {o.batch.cropName} — {o.quantity} — {o.status}
            {o.status === 'delivered' && (
              <button onClick={async () => {
                const shippingFee = Number(prompt('Phi van chuyen?') ?? 0);
                await fetch(`/api/preorders/${o.id}/confirm-receipt`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ finalQuantity: o.quantity, shippingFee }),
                });
                location.reload();
              }}>Xac nhan da nhan + thanh toan</button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
