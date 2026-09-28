import { useCallback, useEffect, useRef, useState } from 'react';
import { readApiErrorMessage } from '@/lib/apiErrorMessage';
import type { BatchSummary } from './BuyerBatchCard';
import { EMPTY_FILTERS, type BatchFilters } from './FilterPanel';

export const PAGE_SIZE = 12;

const NETWORK_ERROR_MESSAGE = 'Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.';

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' };
type BatchPage = { ok: true; items: BatchSummary[]; total: number } | { ok: false; message: string };

const FILTER_QUERY_KEYS = {
  cropName: 'cropName',
  minQuantity: 'minQuantityAvailable',
  location: 'location',
  minPrice: 'minPricePerUnit',
  maxPrice: 'maxPricePerUnit',
  harvestDateFrom: 'harvestDateFrom',
  harvestDateTo: 'harvestDateTo',
} as const;

function buildBatchQuery(filters: BatchFilters, offset: number): string {
  const params = new URLSearchParams();
  for (const [field, queryKey] of Object.entries(FILTER_QUERY_KEYS)) {
    const value = filters[field as keyof typeof FILTER_QUERY_KEYS];
    if (value) params.set(queryKey, value);
  }
  if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
  params.set('limit', String(PAGE_SIZE));
  params.set('offset', String(offset));
  return params.toString();
}

async function fetchBatchPage(filters: BatchFilters, offset: number): Promise<BatchPage> {
  const response = await fetch(`/api/batches?${buildBatchQuery(filters, offset)}`).catch(() => null);
  if (!response) return { ok: false, message: NETWORK_ERROR_MESSAGE };
  if (!response.ok) return { ok: false, message: await readApiErrorMessage(response) };
  const body: { items: BatchSummary[]; total: number } = await response.json().catch(() => ({ items: [], total: 0 }));
  return { ok: true, items: body.items, total: body.total };
}

function appendNewBatches(current: BatchSummary[], incoming: BatchSummary[]): BatchSummary[] {
  const knownIds = new Set(current.map((batch) => batch.id));
  return [...current, ...incoming.filter((batch) => !knownIds.has(batch.id))];
}

export function useMarketplaceBatches() {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [totalBatches, setTotalBatches] = useState(0);
  const [filters, setFilters] = useState<BatchFilters>(EMPTY_FILTERS);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const loadFirstPage = useCallback(async (nextFilters: BatchFilters) => {
    const requestId = ++latestRequest.current;
    setFilters(nextFilters);
    setLoadState({ status: 'loading' });
    setLoadMoreError(null);
    setIsLoadingMore(false);
    const page = await fetchBatchPage(nextFilters, 0);
    if (requestId !== latestRequest.current) return;
    if (!page.ok) {
      setLoadState({ status: 'error', message: page.message });
      return;
    }
    setBatches(page.items);
    setTotalBatches(page.total);
    setLoadState({ status: 'ready' });
  }, []);

  const loadMore = useCallback(async () => {
    const requestId = latestRequest.current;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    const page = await fetchBatchPage(filters, batches.length);
    if (requestId !== latestRequest.current) return;
    setIsLoadingMore(false);
    if (!page.ok) {
      setLoadMoreError(page.message);
      return;
    }
    setBatches((current) => appendNewBatches(current, page.items));
    setTotalBatches(page.total);
  }, [filters, batches.length]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadFirstPage(EMPTY_FILTERS); }, [loadFirstPage]);

  return { batches, totalBatches, filters, loadState, isLoadingMore, loadMoreError, loadFirstPage, loadMore };
}
