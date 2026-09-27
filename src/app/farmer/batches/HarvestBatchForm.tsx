'use client';
import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { formatVnd } from '../../components/MoneySummaryRow';
import { SparkleIcon } from '../../components/icons';
import { BatchCard, type Batch } from './BatchCard';
import styles from './HarvestBatchForm.module.css';

export type EditableBatch = Batch & {
  harvestDateEstimate: string;
  location: string;
  qualityStandard: string | null;
  minOrderQuantity: number;
  description: string | null;
};

type FormState = {
  cropName: string;
  quantityTotal: number;
  unit: string;
  pricePerUnit: number;
  harvestDateEstimate: string;
  location: string;
  qualityStandard: string;
  minOrderQuantity: number;
  description: string;
};

function formStateFromBatch(batch?: EditableBatch): FormState {
  return {
    cropName: batch?.cropName ?? '',
    quantityTotal: batch?.quantityTotal ?? 0,
    unit: batch?.unit ?? 'kg',
    pricePerUnit: batch?.pricePerUnit ?? 0,
    harvestDateEstimate: batch?.harvestDateEstimate.slice(0, 10) ?? '',
    location: batch?.location ?? '',
    qualityStandard: batch?.qualityStandard ?? '',
    minOrderQuantity: batch?.minOrderQuantity ?? 1,
    description: batch?.description ?? '',
  };
}

export function HarvestBatchForm(props: {
  mode: 'create' | 'edit';
  initialBatch?: EditableBatch;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const { mode, initialBatch } = props;
  const [tab, setTab] = useState<'info' | 'preview'>('info');
  const [form, setForm] = useState<FormState>(() => formStateFromBatch(initialBatch));
  const [photo, setPhoto] = useState<File | null>(null);
  const [advisory, setAdvisory] = useState<{
    suggestedMinPrice: number | null;
    suggestedMaxPrice: number | null;
    packagingSuggestion: string;
  } | null>(null);

  useEffect(() => {
    const cropName = form.cropName.trim();
    const timeout = setTimeout(async () => {
      if (cropName.length === 0) {
        setAdvisory(null);
        return;
      }
      const res = await fetch(`/api/batches/advisory?cropName=${encodeURIComponent(cropName)}`);
      if (res.ok) setAdvisory(await res.json());
    }, 400);
    return () => clearTimeout(timeout);
  }, [form.cropName]);

  async function submitCreate() {
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.message ?? error.code);
      return;
    }
    const batch = await res.json();

    if (photo) {
      const photoForm = new FormData();
      photoForm.set('photo', photo);
      const photoRes = await fetch(`/api/batches/${batch.id}/photo`, { method: 'POST', body: photoForm });
      if (!photoRes.ok) {
        const error = await photoRes.json();
        alert(error.message ?? error.code);
      }
    }

    props.onSaved();
  }

  async function submitEdit() {
    if (!initialBatch) return;
    const batchId = initialBatch.id;

    if (form.quantityTotal !== initialBatch.quantityTotal) {
      const res = await fetch(`/api/batches/${batchId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'quantity_adjusted', newQuantityTotal: form.quantityTotal }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.message ?? error.code);
        return;
      }
    }

    if (form.harvestDateEstimate !== initialBatch.harvestDateEstimate.slice(0, 10)) {
      const res = await fetch(`/api/batches/${batchId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'rescheduled', newHarvestDateEstimate: form.harvestDateEstimate }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.message ?? error.code);
        return;
      }
    }

    const patchRes = await fetch(`/api/batches/${batchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropName: form.cropName,
        pricePerUnit: form.pricePerUnit,
        location: form.location,
        qualityStandard: form.qualityStandard,
        minOrderQuantity: form.minOrderQuantity,
        description: form.description,
      }),
    });
    if (!patchRes.ok) {
      const error = await patchRes.json();
      alert(error.message ?? error.code);
      return;
    }

    if (photo) {
      const photoForm = new FormData();
      photoForm.set('photo', photo);
      const photoRes = await fetch(`/api/batches/${batchId}/photo`, { method: 'POST', body: photoForm });
      if (!photoRes.ok) {
        const error = await photoRes.json();
        alert(error.message ?? error.code);
      }
    }

    props.onSaved();
  }
  // TODO(business-confirm): if the progress-update call(s) above succeed but the
  // PATCH fails (or vice versa), the batch is left partially updated with no
  // rollback across the calls — acceptable for demo scope, flag before real use.

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'create') await submitCreate();
    else await submitEdit();
  }

  const previewBatch: Batch = {
    id: initialBatch?.id ?? 'preview',
    cropName: form.cropName,
    quantityTotal: form.quantityTotal,
    quantityAvailable: initialBatch?.quantityAvailable ?? form.quantityTotal,
    unit: form.unit,
    pricePerUnit: form.pricePerUnit,
    status: initialBatch?.status ?? 'open',
    photoUrl: initialBatch?.photoUrl ?? null,
  };

  return (
    <div>
      <div className={styles.tabBar}>
        <button
          type="button"
          className={tab === 'info' ? styles.tabActive : styles.tab}
          onClick={() => setTab('info')}
        >
          Thông tin
        </button>
        <button
          type="button"
          className={tab === 'preview' ? styles.tabActive : styles.tab}
          onClick={() => setTab('preview')}
        >
          Xem trước
        </button>
        <div className={styles.liveSummary}>
          {form.cropName || 'Chưa đặt tên'} · {formatVnd(form.pricePerUnit)}/{form.unit} · {form.quantityTotal} {form.unit}
        </div>
      </div>

      {tab === 'info' ? (
        <form onSubmit={submit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="cropName">Tên nông sản</label>
              <input id="cropName" placeholder="Dưa leo loại 1" value={form.cropName} onChange={(e) => setForm({ ...form, cropName: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="quantityTotal">Sản lượng dự kiến</label>
              <input id="quantityTotal" type="number" placeholder="1200" value={form.quantityTotal} onChange={(e) => setForm({ ...form, quantityTotal: Number(e.target.value) })} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="unit">Đơn vị</label>
              <input id="unit" placeholder="kg" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="pricePerUnit">Giá dự kiến (đồng) / đơn vị</label>
              <input id="pricePerUnit" type="number" placeholder="12000" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: Number(e.target.value) })} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="harvestDateEstimate">Ngày thu hoạch dự kiến</label>
              <input id="harvestDateEstimate" type="date" value={form.harvestDateEstimate} onChange={(e) => setForm({ ...form, harvestDateEstimate: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="location">Địa điểm</label>
              <input id="location" placeholder="Châu Thành, Tiền Giang" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="qualityStandard">Tiêu chuẩn sản phẩm</label>
              <input id="qualityStandard" placeholder="VietGAP, loại 1" value={form.qualityStandard} onChange={(e) => setForm({ ...form, qualityStandard: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label htmlFor="minOrderQuantity">Số lượng tối thiểu đặt trước</label>
              <div className={styles.suffixInput}>
                <input id="minOrderQuantity" type="number" min={1} value={form.minOrderQuantity} onChange={(e) => setForm({ ...form, minOrderQuantity: Number(e.target.value) })} />
                <span className={styles.suffix}>{form.unit}</span>
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="photo">Ảnh mùa vụ (không bắt buộc)</label>
              <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            </div>
            <div className={styles.fieldWide}>
              <label htmlFor="description">Mô tả chi tiết</label>
              <textarea
                id="description"
                rows={4}
                placeholder="Mô tả cách đóng gói, chất lượng, ghi chú cho người mua..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {advisory && (
            <div className={styles.aiHint}>
              <div className={styles.aiHintTitle}>
                <SparkleIcon className={styles.aiHintIcon} />
                Gợi ý từ AI (chỉ mang tính tham khảo)
              </div>
              <div>
                {advisory.suggestedMinPrice !== null
                  ? `Giá tham khảo cho nông sản cùng loại: ${formatVnd(advisory.suggestedMinPrice)} – ${formatVnd(advisory.suggestedMaxPrice ?? advisory.suggestedMinPrice)}/đơn vị.`
                  : 'Chưa có dữ liệu giá lịch sử cho loại nông sản này.'}{' '}
                Đóng gói gợi ý: {advisory.packagingSuggestion}. Nông dân vẫn là người quyết định giá bán và cách đóng gói cuối cùng.
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            {props.onCancel && <Button type="button" variant="outline" onClick={props.onCancel}>Hủy</Button>}
            <Button type="submit">{mode === 'create' ? 'Xem trước và đăng' : 'Lưu thay đổi'}</Button>
          </div>
        </form>
      ) : (
        <div className={styles.previewTab}>
          <BatchCard batch={previewBatch} />
          {form.description && <p className={styles.previewDescription}>{form.description}</p>}
        </div>
      )}
    </div>
  );
}
