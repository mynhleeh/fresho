'use client';
import { useEffect, useState } from 'react';
import styles from './HarvestProgressLog.module.css';

type ProgressUpdate = { id: string; kind: string; note: string | null; previousValue: string | null; newValue: string | null; createdAt: string };

const KIND_LABEL: Record<string, string> = {
  on_track: 'Đúng tiến độ',
  quantity_adjusted: 'Điều chỉnh sản lượng',
  rescheduled: 'Dời ngày thu hoạch',
};

export function HarvestProgressLog({ batchId }: { batchId: string }) {
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);

  useEffect(() => {
    fetch(`/api/batches/${batchId}/progress`).then((r) => (r.ok ? r.json() : [])).then(setUpdates);
  }, [batchId]);

  if (updates.length === 0) return null;

  return (
    <div className={styles.log}>
      {updates.map((u) => (
        <div key={u.id} className={styles.entry}>
          <span className={styles.kind}>{KIND_LABEL[u.kind] ?? u.kind}</span>
          {u.previousValue && u.newValue && (
            <span className={styles.change}> {u.previousValue} → {u.newValue}</span>
          )}
          {u.note && <span className={styles.note}> — {u.note}</span>}
        </div>
      ))}
    </div>
  );
}
