'use client';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
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

export function FilterPanel({ onApply }: { onApply: (filters: BatchFilters) => void }) {
  const [draft, setDraft] = useState<BatchFilters>(EMPTY_FILTERS);

  function updateField<K extends keyof BatchFilters>(field: K, value: BatchFilters[K]) {
    setDraft({ ...draft, [field]: value });
  }

  return (
    <Card className={styles.panel}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>Loại hàng</span>
          <input
            placeholder="Xoài, cà chua..."
            value={draft.cropName}
            onChange={(e) => updateField('cropName', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Số lượng cần mua</span>
          <input
            type="number"
            min={0}
            placeholder="Tối thiểu"
            value={draft.minQuantity}
            onChange={(e) => updateField('minQuantity', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Khu vực nhận hàng</span>
          <input
            placeholder="Tiền Giang"
            value={draft.location}
            onChange={(e) => updateField('location', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Giá tối thiểu</span>
          <input
            type="number"
            min={0}
            placeholder="đ / đơn vị"
            value={draft.minPrice}
            onChange={(e) => updateField('minPrice', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Giá tối đa</span>
          <input
            type="number"
            min={0}
            placeholder="đ / đơn vị"
            value={draft.maxPrice}
            onChange={(e) => updateField('maxPrice', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Nhận hàng từ ngày</span>
          <input
            type="date"
            value={draft.harvestDateFrom}
            onChange={(e) => updateField('harvestDateFrom', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Đến ngày</span>
          <input
            type="date"
            value={draft.harvestDateTo}
            onChange={(e) => updateField('harvestDateTo', e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>Sắp xếp</span>
          <select value={draft.sortBy} onChange={(e) => updateField('sortBy', e.target.value as BatchFilters['sortBy'])}>
            <option value="newest">Mới nhất</option>
            <option value="harvestDate">Ngày thu hoạch gần nhất</option>
            <option value="trustScore">Uy tín người bán</option>
          </select>
        </label>
      </div>
      <div className={styles.actionsRow}>
        <Button variant="outline" onClick={() => { setDraft(EMPTY_FILTERS); onApply(EMPTY_FILTERS); }}>
          Xóa lọc
        </Button>
        <Button onClick={() => onApply(draft)}>Áp dụng</Button>
      </div>
    </Card>
  );
}
