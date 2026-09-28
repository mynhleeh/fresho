'use client';
import { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Overlay } from '../../components/feedback/Overlay';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { useApiList } from '../../components/feedback/useApiList';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import styles from '../admin.module.css';

type Dispute = { id: string; reason: string; status: string; preOrder: { batch: { cropName: string } } };

function ResolveDialog({ dispute, onClose, onResolved }: { dispute: Dispute | null; onClose: () => void; onResolved: () => void }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!dispute) return;
    if (note.trim() === '') {
      setError('Vui lòng nhập ghi chú xử lý để lưu lại lý do quyết định.');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/disputes/${dispute.id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionNote: note.trim() }),
    }).catch(() => null);
    setSaving(false);
    if (!res || !res.ok) {
      setError(await readApiErrorMessage(res));
      return;
    }
    setNote('');
    setError(null);
    onResolved();
  }

  return (
    <Overlay open={dispute !== null} onClose={onClose} label="Xử lý khiếu nại" dismissible={!saving}>
      <div className={styles.dialogBody}>
        <h2>Xử lý khiếu nại {dispute?.preOrder.batch.cropName}</h2>
        <label className={styles.noteField}>
          Ghi chú xử lý
          <textarea
            className={styles.noteInput}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-invalid={error !== null}
            aria-describedby={error ? 'resolve-error' : undefined}
          />
        </label>
        {error && <p id="resolve-error" role="alert" className={styles.fieldError}>{error}</p>}
        <div className={styles.dialogActions}>
          <Button variant="outline" onClick={onClose} disabled={saving}>Quay lại</Button>
          <Button onClick={submit} loading={saving}>Đánh dấu đã xử lý</Button>
        </div>
      </div>
    </Overlay>
  );
}

export default function AdminDisputes() {
  const { state, reload } = useApiList<Dispute>('/api/disputes');
  const [resolving, setResolving] = useState<Dispute | null>(null);

  function handleResolved() {
    setResolving(null);
    reload();
  }

  return (
    <AppShell role="admin">
      <PageFrame>
        <PageHeader eyebrow="Quản trị" title="Khiếu nại" description="Xử lý tranh chấp giữa nông dân và người mua." />
        {state.status === 'loading' && <LoadingSkeleton />}
        {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}
        {state.status === 'ready' && state.items.length === 0 && (
          <EmptyState title="Không có khiếu nại nào" hint="Khi người mua báo vấn đề với đơn hàng, khiếu nại sẽ hiện ở đây." />
        )}
        {state.status === 'ready' && state.items.length > 0 && (
          <div className={styles.list}>
            {state.items.map((dispute) => (
              <Card key={dispute.id} className={styles.row}>
                <div>
                  <div className={styles.rowTitle}>{dispute.preOrder.batch.cropName}</div>
                  <div className={styles.rowMeta}>{dispute.reason}</div>
                </div>
                <StatusBadge
                  label={dispute.status === 'open' ? 'Đang mở' : 'Đã xử lý'}
                  tone={dispute.status === 'open' ? 'warning' : 'success'}
                />
                {dispute.status === 'open' && <Button onClick={() => setResolving(dispute)}>Xử lý</Button>}
              </Card>
            ))}
          </div>
        )}
        <ResolveDialog key={resolving?.id ?? 'closed'} dispute={resolving} onClose={() => setResolving(null)} onResolved={handleResolved} />
      </PageFrame>
    </AppShell>
  );
}
