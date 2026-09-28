'use client';
import { useMemo, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Overlay } from '../../components/feedback/Overlay';
import { PageFrame } from '../../components/layout/PageFrame';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { useApiList } from '../../components/feedback/useApiList';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import { BatchCard } from './BatchCard';
import { EmptyFieldArt, FarmScheduleArt } from './FarmScheduleArt';
import { useCreateBatchPanel } from './CreateBatchPanelContext';
import { HarvestBatchForm, type EditableBatch } from './HarvestBatchForm';
import styles from './page.module.css';

function batchesSummary(batches: EditableBatch[]) {
  const openCount = batches.filter((batch) => batch.status === 'open').length;
  const totalBooked = batches.reduce((sum, batch) => sum + (batch.quantityTotal - batch.quantityAvailable), 0);
  const totalCapacity = batches.reduce((sum, batch) => sum + batch.quantityTotal, 0);
  const bookedPercent = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
  return { openCount, bookedPercent };
}

function FarmerBatchesHeader({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <div className={styles.headerBand}>
      <FarmScheduleArt />
      <div className={styles.headerContent}>
        <span className={styles.eyebrow}>Nông dân</span>
        <h1 className={styles.title}>Mùa vụ của tôi</h1>
        <p className={styles.description}>Đăng đợt thu hoạch sắp tới để người mua chủ động đặt trước.</p>
      </div>
      <Button className={styles.headerAction} onClick={onOpenCreate}>+ Đăng mùa vụ</Button>
    </div>
  );
}

function BatchesStatBand({ batches }: { batches: EditableBatch[] }) {
  const { openCount, bookedPercent } = useMemo(() => batchesSummary(batches), [batches]);
  return (
    <div className={styles.statBand}>
      <div className={styles.statTile}>
        <span className={styles.statValue}>{openCount}</span>
        <span className={styles.statLabel}>lô đang mở đặt trước</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statValue}>{bookedPercent}%</span>
        <span className={styles.statLabel}>tổng sản lượng đã được đặt</span>
      </div>
      <div className={styles.statTile}>
        <span className={styles.statValue}>{batches.length}</span>
        <span className={styles.statLabel}>tổng số mùa vụ đã đăng</span>
      </div>
    </div>
  );
}

function EmptyBatchesState({ onOpenCreate }: { onOpenCreate: () => void }) {
  return (
    <div className={styles.emptyBand}>
      <EmptyFieldArt />
      <p className={styles.emptyTitle}>Bạn chưa đăng mùa vụ nào</p>
      <p className={styles.emptyHint}>Đăng mùa vụ 7–14 ngày trước ngày thu hoạch để người mua đặt trước.</p>
      <Button onClick={onOpenCreate}>+ Đăng mùa vụ đầu tiên</Button>
    </div>
  );
}

export default function FarmerBatches() {
  const createBatchPanel = useCreateBatchPanel();
  const { state, reload } = useApiList<EditableBatch>('/api/batches?mine=1', createBatchPanel.refreshSignal);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchToHide, setBatchToHide] = useState<EditableBatch | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  async function toggleHidden(batchId: string) {
    setToggling(true);
    setActionError(null);
    const res = await fetch(`/api/batches/${batchId}/hidden`, { method: 'PATCH' }).catch(() => null);
    setToggling(false);
    if (!res || !res.ok) {
      setActionError(await readApiErrorMessage(res));
      return;
    }
    reload();
  }

  async function confirmHide() {
    if (!batchToHide) return;
    const target = batchToHide;
    setBatchToHide(null);
    await toggleHidden(target.id);
  }

  function requestToggleHidden(batch: EditableBatch) {
    if (batch.isHidden) toggleHidden(batch.id);
    else setBatchToHide(batch);
  }

  const batches = state.status === 'ready' ? state.items : [];
  const editingBatch = batches.find((b) => b.id === editingBatchId) ?? null;

  return (
    <AppShell role="farmer">
      <PageFrame>
        <FarmerBatchesHeader onOpenCreate={createBatchPanel.open} />
        {actionError && <p role="alert" className={styles.actionError}>{actionError}</p>}
        {state.status === 'loading' && <LoadingSkeleton />}
        {state.status === 'error' && <ErrorState message={state.message} onRetry={reload} />}
        {state.status === 'ready' && batches.length === 0 && <EmptyBatchesState onOpenCreate={createBatchPanel.open} />}
        {batches.length > 0 && <BatchesStatBand batches={batches} />}
        {batches.length > 0 && (
          <div className={styles.cardGrid}>
            {batches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                onEdit={() => setEditingBatchId(batch.id)}
                onToggleHidden={() => requestToggleHidden(batch)}
                isEditFocusElsewhere={editingBatchId !== null && editingBatchId !== batch.id}
              />
            ))}
          </div>
        )}
      </PageFrame>

      <Overlay open={editingBatch !== null} onClose={() => setEditingBatchId(null)} label="Chỉnh sửa mùa vụ">
        {editingBatch && (
          <HarvestBatchForm
            mode="edit"
            initialBatch={editingBatch}
            onCancel={() => setEditingBatchId(null)}
            onSaved={() => {
              setEditingBatchId(null);
              reload();
            }}
          />
        )}
      </Overlay>
      <ConfirmDialog
        open={batchToHide !== null}
        title="Ẩn mùa vụ khỏi người mua?"
        description="Người mua sẽ không thấy mùa vụ này trong chợ cho đến khi bạn chọn Hiện lại. Các đơn đã đặt không bị ảnh hưởng."
        confirmLabel="Ẩn mùa vụ"
        loading={toggling}
        onConfirm={confirmHide}
        onCancel={() => setBatchToHide(null)}
      />
    </AppShell>
  );
}
