'use client';
import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ORDER_FILTERS, type OrderFilter } from './OrderFilterTabs';

export function useOrderFilter(): [OrderFilter, (filter: OrderFilter) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requested = searchParams.get('filter');
  const filter = ORDER_FILTERS.find((candidate) => candidate === requested) ?? 'all';

  const setFilter = useCallback((next: OrderFilter) => {
    router.replace(next === 'all' ? pathname : `${pathname}?filter=${next}`, { scroll: false });
  }, [router, pathname]);

  return [filter, setFilter];
}
