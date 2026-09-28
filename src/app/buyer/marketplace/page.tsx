'use client';
import { useEffect, useRef, useState } from 'react';
import { ButtonLink } from '../../components/ui/ButtonLink';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Overlay } from '../../components/feedback/Overlay';
import { PageFrame } from '../../components/layout/PageFrame';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/feedback/StateBlock';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import { BuyerBatchCard, type BuyerBatch } from './BuyerBatchCard';
import { FilterPanel, EMPTY_FILTERS, type BatchFilters } from './FilterPanel';
import styles from './page.module.css';

type Batch = BuyerBatch;

const PAGE_SIZE = 10;

export default function Marketplace() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [totalBatches, setTotalBatches] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BatchFilters>(EMPTY_FILTERS);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());
  const [messagingBatch, setMessagingBatch] = useState<Batch | null>(null);
  const [loadState, setLoadState] = useState<{ status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' }>({ status: 'loading' });
  const [saveError, setSaveError] = useState<string | null>(null);

  const latestLoad = useRef(0);

  async function load(activeFilters: BatchFilters, targetPage: number) {
    const loadId = ++latestLoad.current;
    const params = new URLSearchParams();
    if (activeFilters.cropName) params.set('cropName', activeFilters.cropName);
    if (activeFilters.minQuantity) params.set('minQuantityAvailable', activeFilters.minQuantity);
    if (activeFilters.location) params.set('location', activeFilters.location);
    if (activeFilters.minPrice) params.set('minPricePerUnit', activeFilters.minPrice);
    if (activeFilters.maxPrice) params.set('maxPricePerUnit', activeFilters.maxPrice);
    if (activeFilters.harvestDateFrom) params.set('harvestDateFrom', activeFilters.harvestDateFrom);
    if (activeFilters.harvestDateTo) params.set('harvestDateTo', activeFilters.harvestDateTo);
    if (activeFilters.sortBy !== 'newest') params.set('sortBy', activeFilters.sortBy);
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String((targetPage - 1) * PAGE_SIZE));
    setLoadState({ status: 'loading' });
    const res = await fetch(`/api/batches?${params.toString()}`).catch(() => null);
    if (!res || !res.ok) {
      setLoadState({ status: 'error', message: res ? await readApiErrorMessage(res) : 'Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.' });
      return;
    }
    const data: { items: Batch[]; total: number } = await res.json().catch(() => ({ items: [], total: 0 }));
    if (loadId !== latestLoad.current) return;
    setBatches(data.items);
    setTotalBatches(data.total);
    setPage(targetPage);
    setLoadState({ status: 'ready' });
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  async function loadSaved() {
    const res = await fetch('/api/batches/saved').catch(() => null);
    if (!res || !res.ok) return;
    const saved: Batch[] = await res.json();
    setSavedIds(new Set(saved.map((b) => b.id)));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(EMPTY_FILTERS, 1); loadSaved(); }, []);

  function applyFilters(nextFilters: BatchFilters) {
    setFilters(nextFilters);
    load(nextFilters, 1);
  }

  function goToPage(nextPage: number) {
    load(filters, nextPage);
  }

  async function toggleSave(batchId: string) {
    const isSaved = savedIds.has(batchId);
    setSaveError(null);
    const res = await fetch(`/api/batches/${batchId}/save`, { method: isSaved ? 'DELETE' : 'POST' }).catch(() => null);
    if (!res || !res.ok) {
      setSaveError(await readApiErrorMessage(res));
      return;
    }
    const next = new Set(savedIds);
    if (isSaved) next.delete(batchId); else next.add(batchId);
    setSavedIds(next);
  }

  function toggleCompare(batchId: string) {
    const next = new Set(comparedIds);
    if (next.has(batchId)) next.delete(batchId); else next.add(batchId);
    setComparedIds(next);
  }

  return (
    <AppShell role="buyer">
      <PageFrame wide>
        <PageHeader eyebrow="Người mua" title="Tìm nông sản" description="Khám phá các lô hàng sắp thu hoạch." />
        {saveError && <p role="alert" className={styles.saveError}>{saveError}</p>}

        <FilterPanel onApply={applyFilters} />

        {comparedIds.size > 0 && (
          <div className={styles.compareBar}>
            Đang so sánh {comparedIds.size} lô hàng
            <Button variant="outline" onClick={() => setComparedIds(new Set())}>Bỏ chọn tất cả</Button>
          </div>
        )}

        {loadState.status === 'loading' && <LoadingSkeleton rows={4} />}
        {loadState.status === 'error' && <ErrorState message={loadState.message} onRetry={() => load(filters, page)} />}
        {loadState.status === 'ready' && batches.length === 0 && (
          <EmptyState title="Chưa có lô hàng phù hợp" hint="Thử bỏ bớt bộ lọc hoặc mở rộng khoảng giá và ngày thu hoạch." />
        )}

        <div className={styles.grid}>
          {loadState.status === 'ready' && batches.map((b) => (
            <BuyerBatchCard
              key={b.id}
              batch={b}
              isSaved={savedIds.has(b.id)}
              isCompared={comparedIds.has(b.id)}
              onToggleSave={() => toggleSave(b.id)}
              onToggleCompare={() => toggleCompare(b.id)}
              onMessage={() => setMessagingBatch(b)}
            />
          ))}
        </div>

        {totalBatches > PAGE_SIZE && (
          <div className={styles.pagination}>
            <Button variant="outline" disabled={page === 1 || loadState.status === 'loading'} onClick={() => goToPage(page - 1)}>
              Trước
            </Button>
            <span className={styles.pageIndicator}>
              Trang {page} / {Math.ceil(totalBatches / PAGE_SIZE)}
            </span>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(totalBatches / PAGE_SIZE) || loadState.status === 'loading'}
              onClick={() => goToPage(page + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </PageFrame>

      <Overlay open={messagingBatch !== null} onClose={() => setMessagingBatch(null)} label="Nhắn tin với nông dân">
        {messagingBatch && (
          <div className={styles.messageOverlay}>
            <span className={styles.orderPanelTitle}>Nhắn tin với {messagingBatch.farmer.name}</span>
            <p className={styles.batchMeta}>
              {/* TODO(business-confirm): chưa có kênh chat tự do lúc browse — OrderMessage hiện chỉ gắn theo pre_order đã tồn tại */}
              Bạn cần đặt trước lô hàng &quot;{messagingBatch.cropName}&quot; để mở kênh nhắn tin trực tiếp với nông dân.
            </p>
            <ButtonLink href={`/buyer/marketplace/${messagingBatch.id}`} onClick={() => setMessagingBatch(null)}>
              Xem lô hàng để đặt trước
            </ButtonLink>
          </div>
        )}
      </Overlay>
    </AppShell>
  );
}
