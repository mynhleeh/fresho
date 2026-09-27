'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '../../components/AppShell';
import { Button } from '../../components/Button';
import { Overlay } from '../../components/Overlay';
import { BatchCard } from './BatchCard';
import { HarvestBatchForm, type EditableBatch } from './HarvestBatchForm';
import styles from './page.module.css';

export default function FarmerBatches() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batches, setBatches] = useState<EditableBatch[]>([]);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(() => searchParams.get('new') === '1');

  useEffect(() => {
    if (searchParams.get('new') === '1') router.replace('/farmer/batches');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount to strip the ?new=1 launch param from the URL
  }, []);

  async function load() {
    const res = await fetch('/api/batches?mine=1');
    setBatches(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function updateStage(batchId: string, stage: 'awaiting_harvest' | 'ready_for_handover') {
    await fetch(`/api/batches/${batchId}/ready`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    load();
  }

  const editingBatch = batches.find((b) => b.id === editingBatchId) ?? null;

  return (
    <AppShell role="farmer">
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.heading}>Mùa vụ của tôi</h1>
            <p className={styles.subheading}>Đăng đợt thu hoạch sắp tới để người mua chủ động đặt trước.</p>
          </div>
          <Button onClick={() => setIsCreating(true)}>+ Đăng mùa vụ</Button>
        </div>

        <div className={styles.cardGrid}>
          {batches.map((b) => (
            <BatchCard
              key={b.id}
              batch={b}
              onStartHarvest={() => updateStage(b.id, 'awaiting_harvest')}
              onMarkReady={() => updateStage(b.id, 'ready_for_handover')}
              onEdit={() => setEditingBatchId(b.id)}
            />
          ))}
        </div>
      </div>

      <Overlay
        open={editingBatch !== null || isCreating}
        onClose={() => {
          setEditingBatchId(null);
          setIsCreating(false);
        }}
      >
        {editingBatch && (
          <HarvestBatchForm
            mode="edit"
            initialBatch={editingBatch}
            onCancel={() => setEditingBatchId(null)}
            onSaved={() => {
              setEditingBatchId(null);
              load();
            }}
          />
        )}
        {isCreating && (
          <HarvestBatchForm
            mode="create"
            onCancel={() => setIsCreating(false)}
            onSaved={() => {
              setIsCreating(false);
              load();
            }}
          />
        )}
      </Overlay>
    </AppShell>
  );
}
