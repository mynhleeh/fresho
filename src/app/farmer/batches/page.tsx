'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Button } from '../../components/Button';
import { Overlay } from '../../components/Overlay';
import { BatchCard } from './BatchCard';
import { useCreateBatchPanel } from './CreateBatchPanelContext';
import { HarvestBatchForm, type EditableBatch } from './HarvestBatchForm';
import styles from './page.module.css';

export default function FarmerBatches() {
  const [batches, setBatches] = useState<EditableBatch[]>([]);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const createBatchPanel = useCreateBatchPanel();

  async function load() {
    const res = await fetch('/api/batches?mine=1');
    if (!res.ok) return;
    setBatches(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount/refetch-on-signal; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, [createBatchPanel.refreshSignal]);

  async function toggleHidden(batchId: string) {
    await fetch(`/api/batches/${batchId}/hidden`, { method: 'PATCH' });
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
          <Button onClick={createBatchPanel.open}>+ Đăng mùa vụ</Button>
        </div>

        <div className={styles.cardGrid}>
          {batches.map((b) => (
            <BatchCard
              key={b.id}
              batch={b}
              onEdit={() => setEditingBatchId(b.id)}
              onToggleHidden={() => toggleHidden(b.id)}
            />
          ))}
        </div>
      </div>

      <Overlay open={editingBatch !== null} onClose={() => setEditingBatchId(null)}>
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
      </Overlay>
    </AppShell>
  );
}
