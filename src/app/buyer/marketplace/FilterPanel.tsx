'use client';
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import styles from './FilterPanel.module.css';

export type BatchFilters = {
  cropName: string;
  minQuantity: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  harvestDateFrom: string;
  harvestDateTo: string;
  sortBy: 'newest' | 'harvestDate' | 'trustScore';
};

export const EMPTY_FILTERS: BatchFilters = {
  cropName: '',
  minQuantity: '',
  location: '',
  minPrice: '',
  maxPrice: '',
  harvestDateFrom: '',
  harvestDateTo: '',
  sortBy: 'newest',
};

type InputField = Exclude<keyof BatchFilters, 'sortBy'>;

const INPUT_FIELDS: { field: InputField; label: string; type: 'text' | 'number' | 'date'; placeholder?: string; isWide?: boolean }[] = [
  { field: 'cropName', label: 'Loại hàng', type: 'text', placeholder: 'Xoài, cà chua...', isWide: true },
  { field: 'minQuantity', label: 'Số lượng cần mua', type: 'number', placeholder: 'Tối thiểu' },
  { field: 'location', label: 'Khu vực nhận hàng', type: 'text', placeholder: 'Tiền Giang', isWide: true },
  { field: 'minPrice', label: 'Giá tối thiểu', type: 'number', placeholder: 'đ / đơn vị' },
  { field: 'maxPrice', label: 'Giá tối đa', type: 'number', placeholder: 'đ / đơn vị' },
  { field: 'harvestDateFrom', label: 'Nhận hàng từ ngày', type: 'date' },
  { field: 'harvestDateTo', label: 'Đến ngày', type: 'date' },
];

export function FilterPanel({ onApply }: { onApply: (filters: BatchFilters) => void }) {
  const [draft, setDraft] = useState<BatchFilters>(EMPTY_FILTERS);

  function updateField<K extends keyof BatchFilters>(field: K, value: BatchFilters[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply(draft);
  }

  function clearFilters() {
    setDraft(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
  }

  return (
    <form className={styles.panel} onSubmit={submitFilters}>
      <div className={styles.grid}>
        {INPUT_FIELDS.map(({ field, label, type, placeholder, isWide }) => (
          <label key={field} className={`${styles.field} ${isWide ? styles.wide : ''}`}>
            <span>{label}</span>
            <input
              type={type}
              min={type === 'number' ? 0 : undefined}
              placeholder={placeholder}
              value={draft[field]}
              onChange={(event) => updateField(field, event.target.value)}
            />
          </label>
        ))}
        <label className={styles.field}>
          <span>Sắp xếp</span>
          <select value={draft.sortBy} onChange={(event) => updateField('sortBy', event.target.value as BatchFilters['sortBy'])}>
            <option value="newest">Mới nhất</option>
            <option value="harvestDate">Ngày thu hoạch gần nhất</option>
            <option value="trustScore">Uy tín người bán</option>
          </select>
        </label>
      </div>
      <div className={styles.actionsRow}>
        <Button variant="outline" onClick={clearFilters}>Xóa lọc</Button>
        <Button type="submit">Áp dụng</Button>
      </div>
    </form>
  );
}
