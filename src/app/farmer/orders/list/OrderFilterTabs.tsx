import type { FarmerGroup } from '@/lib/order/orderWorkflow';
import { GROUP_LABEL } from '../data/orderTypes';
import styles from './orderFilterTabs.module.css';

export type OrderFilter = 'all' | FarmerGroup;

export const ORDER_FILTERS: OrderFilter[] = ['all', 'needs_action', 'in_progress', 'done'];

type Props = {
  active: OrderFilter;
  counts: Record<FarmerGroup, number>;
  total: number;
  onChange: (filter: OrderFilter) => void;
};

export function OrderFilterTabs({ active, counts, total, onChange }: Props) {
  return (
    <div className={styles.tabs} role="group" aria-label="Lọc đơn theo nhóm">
      {ORDER_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`${styles.tab} ${active === filter ? styles.active : ''}`}
          aria-pressed={active === filter}
          onClick={() => onChange(filter)}
        >
          {filter === 'all' ? 'Tất cả' : GROUP_LABEL[filter]}
          <span className={styles.count}>{filter === 'all' ? total : counts[filter]}</span>
        </button>
      ))}
    </div>
  );
}
