'use client';
import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { formatVnd } from '../../components/MoneySummaryRow';
import { SparkleIcon } from '../../components/icons';
import { batchStatusInfo } from '@/lib/orderStatus';
import { StatusBadge } from '../../components/StatusBadge';
import { BatchCard, type Batch } from './BatchCard';
import { BatchPhotoGallery, type GalleryPhoto } from './BatchPhotoGallery';
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
  status: string;
};

const FARMER_SELECTABLE_STATUSES = [
  { value: 'open', label: 'Đang mở đặt trước' },
  { value: 'ready_for_handover', label: 'Sẵn sàng bàn giao' },
  { value: 'closed', label: 'Kết thúc mùa vụ' },
];

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
    status: batch?.status ?? 'open',
  };
}

// A photo not yet uploaded (create mode, batch doesn't exist yet) vs one already
// persisted server-side (edit mode, or after upload during create).
type PendingPhoto = { key: string; kind: 'pending'; file: File; url: string; isCover: boolean };
type PersistedPhoto = { key: string; kind: 'persisted'; id: string; url: string; isCover: boolean };
type FormPhoto = PendingPhoto | PersistedPhoto;

function toGalleryPhotos(photos: FormPhoto[]): GalleryPhoto[] {
  return photos.map((p) => ({ key: p.key, url: p.url, isCover: p.isCover }));
}

function promoteFirstAsCover(photos: FormPhoto[]): FormPhoto[] {
  return photos.map((p, index) => ({ ...p, isCover: index === 0 }));
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
  const [photos, setPhotos] = useState<FormPhoto[]>([]);
  const [advisory, setAdvisory] = useState<{
    suggestedMinPrice: number | null;
    suggestedMaxPrice: number | null;
    packagingSuggestion: string;
  } | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !initialBatch) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/batches/${initialBatch.id}/photos`);
      if (!res.ok || cancelled) return;
      const loaded: { id: string; url: string; isCover: boolean }[] = await res.json();
      setPhotos(loaded.map((p) => ({ key: p.id, kind: 'persisted', id: p.id, url: p.url, isCover: p.isCover })));
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, initialBatch]);

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

  function addPendingPhoto(file: File) {
    setPhotos((current) => [
      ...current,
      { key: `pending-${crypto.randomUUID()}`, kind: 'pending', file, url: URL.createObjectURL(file), isCover: current.length === 0 },
    ]);
  }

  async function addPersistedPhoto(batchId: string, file: File) {
    const body = new FormData();
    body.set('photo', file);
    const res = await fetch(`/api/batches/${batchId}/photos`, { method: 'POST', body });
    if (!res.ok) {
      const error = await res.json();
      alert(error.message ?? error.code);
      return;
    }
    const photo: { id: string; url: string; isCover: boolean } = await res.json();
    setPhotos((current) => [...current, { key: photo.id, kind: 'persisted', id: photo.id, url: photo.url, isCover: photo.isCover }]);
  }

  function removePendingPhoto(key: string) {
    setPhotos((current) => {
      const removedWasCover = current.find((p) => p.key === key)?.isCover ?? false;
      const remaining = current.filter((p) => p.key !== key);
      return removedWasCover ? promoteFirstAsCover(remaining) : remaining;
    });
  }

  async function removePersistedPhoto(batchId: string, photoId: string) {
    const res = await fetch(`/api/batches/${batchId}/photos/${photoId}`, { method: 'DELETE' });
    if (!res.ok) {
      const error = await res.json();
      alert(error.message ?? error.code);
      return;
    }
    const refreshed = await fetch(`/api/batches/${batchId}/photos`);
    const loaded: { id: string; url: string; isCover: boolean }[] = await refreshed.json();
    setPhotos(loaded.map((p) => ({ key: p.id, kind: 'persisted', id: p.id, url: p.url, isCover: p.isCover })));
  }

  function setCoverPending(key: string) {
    setPhotos((current) => current.map((p) => ({ ...p, isCover: p.key === key })));
  }

  async function setCoverPersisted(batchId: string, photoId: string) {
    const res = await fetch(`/api/batches/${batchId}/photos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCover: true }),
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.message ?? error.code);
      return;
    }
    setPhotos((current) => current.map((p) => ({ ...p, isCover: p.kind === 'persisted' && p.id === photoId })));
  }

  async function uploadPendingPhotosAfterCreate(batchId: string) {
    const pending = photos.filter((p): p is PendingPhoto => p.kind === 'pending');
    const ordered = [...pending].sort((a, b) => Number(b.isCover) - Number(a.isCover));
    for (const photo of ordered) {
      const body = new FormData();
      body.set('photo', photo.file);
      const res = await fetch(`/api/batches/${batchId}/photos`, { method: 'POST', body });
      if (!res.ok) {
        const error = await res.json();
        alert(error.message ?? error.code);
      }
    }
  }

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

    await uploadPendingPhotosAfterCreate(batch.id);

    props.onSaved();
  }

  async function submitEdit() {
    if (!initialBatch) return;
    const batchId = initialBatch.id;

    if (!(form.quantityTotal > 0)) {
      alert('Sản lượng dự kiến phải lớn hơn 0');
      return;
    }
    if (form.minOrderQuantity > form.quantityTotal) {
      alert('Số lượng tối thiểu đặt trước không thể vượt quá sản lượng dự kiến');
      return;
    }

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
        status: form.status,
      }),
    });
    if (!patchRes.ok) {
      const error = await patchRes.json();
      alert(error.message ?? error.code);
      return;
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

  const coverPhotoUrl = photos.find((p) => p.isCover)?.url ?? initialBatch?.photoUrl ?? null;

  const previewBatch: Batch = {
    id: initialBatch?.id ?? 'preview',
    cropName: form.cropName,
    quantityTotal: form.quantityTotal,
    quantityAvailable: initialBatch?.quantityAvailable ?? form.quantityTotal,
    unit: form.unit,
    pricePerUnit: form.pricePerUnit,
    status: form.status,
    photoUrl: coverPhotoUrl,
  };

  return (
    <div className={styles.formRoot}>
      <div className={styles.stickyHeader}>
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
        </div>
        <div className={styles.liveSummary}>
          {form.cropName || 'Chưa đặt tên'} · {formatVnd(form.pricePerUnit)}/{form.unit} · {form.quantityTotal} {form.unit}
        </div>
      </div>

      <form
        id="harvest-batch-form"
        onSubmit={submit}
        className={styles.scrollBody}
        style={{ display: tab === 'info' ? undefined : 'none' }}
      >
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
              <input
                id="unit"
                placeholder="kg"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                disabled={mode === 'edit'}
                title={mode === 'edit' ? 'Không thể đổi đơn vị sau khi đăng' : undefined}
                required
              />
              {mode === 'edit' && <span className={styles.fieldHint}>Không thể đổi đơn vị sau khi đăng</span>}
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
            {mode === 'edit' && initialBatch && (
              <div className={styles.field}>
                <label htmlFor="status">Trạng thái mùa vụ</label>
                <div className={styles.statusControl}>
                  <StatusBadge id="status-current" {...batchStatusInfo(initialBatch.status)} />
                  <select
                    id="status"
                    className={styles.statusSelect}
                    value={form.status}
                    aria-describedby="status-current"
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {!FARMER_SELECTABLE_STATUSES.some((option) => option.value === initialBatch.status) && (
                      // TODO(business-confirm): awaiting_harvest is a system-set stage (deliveryService),
                      // shown read-only here since farmers don't pick it manually from this dropdown.
                      <option value={initialBatch.status} disabled>{batchStatusInfo(initialBatch.status).label}</option>
                    )}
                    {FARMER_SELECTABLE_STATUSES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
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
            <div className={styles.fieldWide}>
              <label htmlFor="photos">Ảnh mùa vụ (không bắt buộc)</label>
              <BatchPhotoGallery
                id="photos"
                photos={toGalleryPhotos(photos)}
                onAdd={(file) => (initialBatch ? addPersistedPhoto(initialBatch.id, file) : addPendingPhoto(file))}
                onRemove={(key) => {
                  const photo = photos.find((p) => p.key === key);
                  if (!photo) return;
                  if (photo.kind === 'persisted' && initialBatch) removePersistedPhoto(initialBatch.id, photo.id);
                  else removePendingPhoto(key);
                }}
                onSetCover={(key) => {
                  const photo = photos.find((p) => p.key === key);
                  if (!photo) return;
                  if (photo.kind === 'persisted' && initialBatch) setCoverPersisted(initialBatch.id, photo.id);
                  else setCoverPending(key);
                }}
              />
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
      </form>

      <div className={styles.scrollBody} style={{ display: tab === 'preview' ? undefined : 'none' }}>
        <div className={styles.previewTab}>
          <BatchCard batch={previewBatch} />
          {form.description && <p className={styles.previewDescription}>{form.description}</p>}
        </div>
      </div>

      <div className={styles.stickyFooter}>
        {props.onCancel && <Button type="button" variant="outline" onClick={props.onCancel}>Hủy</Button>}
        <Button type="submit" form="harvest-batch-form">{mode === 'create' ? 'Xem trước và đăng' : 'Lưu thay đổi'}</Button>
      </div>
    </div>
  );
}
