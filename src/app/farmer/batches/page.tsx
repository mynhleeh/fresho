'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { Button } from '../../components/Button';
import { BatchCard, type Batch } from './BatchCard';
import styles from './page.module.css';

export default function FarmerBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [progressBatchId, setProgressBatchId] = useState<string | null>(null);
  const [progressQuantity, setProgressQuantity] = useState(0);
  const [progressDate, setProgressDate] = useState('');

  async function load() {
    const res = await fetch('/api/batches?mine=1');
    setBatches(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function postProgress(batchId: string, kind: 'on_track' | 'quantity_adjusted' | 'rescheduled') {
    const body =
      kind === 'quantity_adjusted'
        ? { kind, newQuantityTotal: progressQuantity }
        : kind === 'rescheduled'
          ? { kind, newHarvestDateEstimate: progressDate }
          : { kind };

    const res = await fetch(`/api/batches/${batchId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.message ?? error.code);
      return;
    }
    setProgressBatchId(null);
    load();
  }

  async function updateStage(batchId: string, stage: 'awaiting_harvest' | 'ready_for_handover') {
    await fetch(`/api/batches/${batchId}/ready`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    load();
  }

  return (
    <AppShell role="farmer">
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.heading}>Mùa vụ của tôi</h1>
            <p className={styles.subheading}>Đăng đợt thu hoạch sắp tới để người mua chủ động đặt trước.</p>
          </div>
          <Link href="/farmer/batches/new">
            <Button>+ Đăng mùa vụ</Button>
          </Link>
        </div>

        <div className={styles.cardGrid}>
          {batches.map((b) => (
            <BatchCard
              key={b.id}
              batch={b}
              onStartHarvest={() => updateStage(b.id, 'awaiting_harvest')}
              onMarkReady={() => updateStage(b.id, 'ready_for_handover')}
              onToggleProgress={() => setProgressBatchId(progressBatchId === b.id ? null : b.id)}
              progressOpen={progressBatchId === b.id}
              onPostProgress={(kind) => postProgress(b.id, kind)}
              progressQuantity={progressQuantity}
              onProgressQuantityChange={setProgressQuantity}
              progressDate={progressDate}
              onProgressDateChange={setProgressDate}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
