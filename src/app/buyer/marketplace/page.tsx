'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Overlay } from '../../components/feedback/Overlay';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState, ErrorState } from '../../components/feedback/StateBlock';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import { BatchGridSkeleton } from './BatchCardParts';
import { BuyerBatchCard, type BatchSummary } from './BuyerBatchCard';
import { EMPTY_FILTERS, FilterPanel } from './FilterPanel';
import { PAGE_SIZE, useMarketplaceBatches } from './useMarketplaceBatches';
import styles from './page.module.css';

const EAGER_IMAGE_COUNT = 3;

function useSavedBatchIds() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const savedIdsRef = useRef(savedIds);

  const replaceSavedIds = useCallback((nextIds: Set<string>) => {
    savedIdsRef.current = nextIds;
    setSavedIds(nextIds);
  }, []);

  useEffect(() => {
    fetch('/api/batches/saved')
      .then((response) => (response.ok ? response.json() : []))
      .then((saved: { id: string }[]) => replaceSavedIds(new Set(saved.map((batch) => batch.id))))
      .catch(() => undefined);
  }, [replaceSavedIds]);

  const toggleSave = useCallback(async (batchId: string) => {
    const isSaved = savedIdsRef.current.has(batchId);
    setSaveError(null);
    const response = await fetch(`/api/batches/${batchId}/save`, { method: isSaved ? 'DELETE' : 'POST' }).catch(() => null);
    if (!response || !response.ok) {
      setSaveError(await readApiErrorMessage(response));
      return;
    }
    const nextIds = new Set(savedIdsRef.current);
    if (isSaved) nextIds.delete(batchId); else nextIds.add(batchId);
    replaceSavedIds(nextIds);
  }, [replaceSavedIds]);

  return { savedIds, saveError, toggleSave };
}

function useComparedBatchIds() {
  const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());

  const toggleCompare = useCallback((batchId: string) => {
    setComparedIds((current) => {
      const next = new Set(current);
      if (next.has(batchId)) next.delete(batchId); else next.add(batchId);
      return next;
    });
  }, []);

  const clearCompared = useCallback(() => setComparedIds(new Set()), []);
  return { comparedIds, toggleCompare, clearCompared };
}

function MessageDialog({ batch, onClose }: { batch: BatchSummary | null; onClose: () => void }) {
  return (
    <Overlay open={batch !== null} onClose={onClose} label="Nhắn tin với nông dân">
      {batch && (
        <div className={styles.messageOverlay}>
          <span className={styles.orderPanelTitle}>Nhắn tin với {batch.farmer.name}</span>
          <p className={styles.batchMeta}>
            {/* TODO(business-confirm): chưa có kênh chat tự do lúc browse — OrderMessage hiện chỉ gắn theo pre_order đã tồn tại */}
            Bạn cần đặt trước lô hàng &quot;{batch.cropName}&quot; để mở kênh nhắn tin trực tiếp với nông dân.
          </p>
          <ButtonLink href={`/buyer/marketplace/${batch.id}`} onClick={onClose}>
            Xem lô hàng để đặt trước
          </ButtonLink>
        </div>
      )}
    </Overlay>
  );
}

export default function Marketplace() {
  const { batches, totalBatches, filters, loadState, isLoadingMore, loadMoreError, loadFirstPage, loadMore } = useMarketplaceBatches();
  const { savedIds, saveError, toggleSave } = useSavedBatchIds();
  const { comparedIds, toggleCompare, clearCompared } = useComparedBatchIds();
  const [messagingBatch, setMessagingBatch] = useState<BatchSummary | null>(null);
  const [filterResetCount, setFilterResetCount] = useState(0);
  const closeMessageDialog = useCallback(() => setMessagingBatch(null), []);
  const resetFilters = useCallback(() => {
    setFilterResetCount((count) => count + 1);
    loadFirstPage(EMPTY_FILTERS);
  }, [loadFirstPage]);
  const hasMore = batches.length < totalBatches;

  return (
    <AppShell role="buyer">
      <PageFrame wide>
        <PageHeader eyebrow="Người mua" title="Tìm nông sản" description="Khám phá các lô hàng sắp thu hoạch." />
        {saveError && <p role="alert" className={styles.saveError}>{saveError}</p>}

        <FilterPanel key={filterResetCount} onApply={loadFirstPage} />

        {comparedIds.size > 0 && (
          <div className={styles.compareBar}>
            Đang so sánh {comparedIds.size} lô hàng
            <Button variant="outline" onClick={clearCompared}>Bỏ chọn tất cả</Button>
          </div>
        )}

        {loadState.status === 'loading' && <BatchGridSkeleton count={PAGE_SIZE / 2} />}
        {loadState.status === 'error' && <ErrorState message={loadState.message} onRetry={() => loadFirstPage(filters)} />}
        {loadState.status === 'ready' && batches.length === 0 && (
          <EmptyState
            title="Chưa có lô hàng phù hợp"
            hint="Thử bỏ bớt bộ lọc hoặc mở rộng khoảng giá và ngày thu hoạch."
            action={<Button variant="outline" onClick={resetFilters}>Xóa lọc</Button>}
          />
        )}

        {loadState.status === 'ready' && batches.length > 0 && (
          <div className={styles.grid}>
            {batches.map((batch, index) => (
              <BuyerBatchCard
                key={batch.id}
                batch={batch}
                isSaved={savedIds.has(batch.id)}
                isCompared={comparedIds.has(batch.id)}
                isFeatured={index === 0}
                isEager={index < EAGER_IMAGE_COUNT}
                onToggleSave={toggleSave}
                onToggleCompare={toggleCompare}
                onMessage={setMessagingBatch}
              />
            ))}
          </div>
        )}

        {loadState.status === 'ready' && batches.length > 0 && (
          <div className={styles.loadMore}>
            <span className={styles.loadMoreStatus}>Đang hiển thị {batches.length} / {totalBatches} lô hàng</span>
            {loadMoreError && <p role="alert" className={styles.saveError}>{loadMoreError}</p>}
            {hasMore && <Button variant="outline" loading={isLoadingMore} onClick={loadMore}>Xem thêm lô hàng</Button>}
          </div>
        )}
      </PageFrame>

      <MessageDialog batch={messagingBatch} onClose={closeMessageDialog} />
    </AppShell>
  );
}
