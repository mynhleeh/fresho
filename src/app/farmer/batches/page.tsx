'use client';
import { useEffect, useState } from 'react';

type Batch = { id: string; cropName: string; quantityTotal: number; quantityAvailable: number; unit: string; pricePerUnit: number; status: string };

export default function FarmerBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState({ cropName: '', quantityTotal: 0, unit: 'kg', pricePerUnit: 0, harvestDateEstimate: '' });

  async function load() {
    const res = await fetch('/api/batches');
    setBatches(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ cropName: '', quantityTotal: 0, unit: 'kg', pricePerUnit: 0, harvestDateEstimate: '' });
    load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Batch cua toi</h1>
      <form onSubmit={submit}>
        <input placeholder="Ten nong san" value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })} required />
        <input type="number" placeholder="So luong" value={form.quantityTotal} onChange={(e) => setForm({ ...form, quantityTotal: Number(e.target.value) })} required />
        <input placeholder="Don vi" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
        <input type="number" placeholder="Gia/don vi" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: Number(e.target.value) })} required />
        <input type="date" value={form.harvestDateEstimate} onChange={(e) => setForm({ ...form, harvestDateEstimate: e.target.value })} required />
        <button type="submit">Dang batch</button>
      </form>
      <ul>
        {batches.map((b) => (
          <li key={b.id}>{b.cropName} — {b.quantityAvailable}/{b.quantityTotal} {b.unit} @ {b.pricePerUnit} — {b.status}
            <button onClick={async () => { await fetch(`/api/batches/${b.id}/ready`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'awaiting_harvest' }) }); load(); }}>Bat dau thu hoach</button>
            <button onClick={async () => { await fetch(`/api/batches/${b.id}/ready`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'ready_for_handover' }) }); load(); }}>San sang giao</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
