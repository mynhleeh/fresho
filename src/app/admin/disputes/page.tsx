'use client';
import { useEffect, useState } from 'react';

type Dispute = { id: string; reason: string; status: string; preOrder: { batch: { cropName: string } } };

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  async function load() {
    const res = await fetch('/api/disputes');
    setDisputes(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function resolve(id: string) {
    const resolutionNote = prompt('Ghi chu xu ly?') ?? '';
    await fetch(`/api/disputes/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionNote }),
    });
    load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Tranh chap</h1>
      <ul>
        {disputes.map((d) => (
          <li key={d.id}>
            {d.preOrder.batch.cropName} — {d.reason} — {d.status}
            {d.status === 'open' && <button onClick={() => resolve(d.id)}>Xu ly</button>}
          </li>
        ))}
      </ul>
    </main>
  );
}
