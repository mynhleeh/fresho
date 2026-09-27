'use client';
import { useEffect, useState } from 'react';

type Batch = { id: string; cropName: string; quantityAvailable: number; unit: string; pricePerUnit: number };

export default function Marketplace() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  async function load() {
    const res = await fetch('/api/batches');
    setBatches(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function order(batchId: string) {
    const quantity = quantities[batchId] ?? 1;
    const res = await fetch('/api/preorders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, quantity }),
    });
    const preOrder = await res.json();
    if (res.ok) {
      const batch = batches.find((b) => b.id === batchId);
      if (!batch) {
        alert('Batch không còn tồn tại, vui lòng tải lại trang');
        load();
        return;
      }
      const depositRes = await fetch(`/api/preorders/${preOrder.id}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(quantity * batch.pricePerUnit * 0.2) }),
      });
      if (depositRes.ok) {
        alert('Da dat truoc va thanh toan coc');
      } else {
        const depositError = await depositRes.json();
        alert(`Da dat truoc nhung thanh toan coc that bai: ${depositError.message ?? depositError.code}`);
      }
      load();
    } else {
      alert(preOrder.message);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Cho batch</h1>
      <ul>
        {batches.map((b) => (
          <li key={b.id}>
            {b.cropName} — con {b.quantityAvailable} {b.unit} @ {b.pricePerUnit}
            <input type="number" min={1} max={b.quantityAvailable} defaultValue={1}
              onChange={(e) => setQuantities({ ...quantities, [b.id]: Number(e.target.value) })} />
            <button onClick={() => order(b.id)}>Dat truoc + coc 20%</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
