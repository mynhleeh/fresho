'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { formatVnd } from '../../components/MoneySummaryRow';
import { SparkleIcon } from '../../components/icons';
import { batchStatusInfo } from '@/lib/orderStatus';
import styles from './page.module.css';

type Batch = { id: string; cropName: string; quantityTotal: number; quantityAvailable: number; unit: string; pricePerUnit: number; status: string };

export default function FarmerBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState({
    cropName: '',
    quantityTotal: 0,
    unit: 'kg',
    pricePerUnit: 0,
    harvestDateEstimate: '',
    location: '',
    qualityStandard: '',
    minOrderQuantity: 1,
  });
  const [progressBatchId, setProgressBatchId] = useState<string | null>(null);
  const [progressQuantity, setProgressQuantity] = useState(0);
  const [progressDate, setProgressDate] = useState('');
  const [advisory, setAdvisory] = useState<{
    suggestedMinPrice: number | null;
    suggestedMaxPrice: number | null;
    packagingSuggestion: string;
  } | null>(null);

  async function load() {
    const res = await fetch('/api/batches');
    setBatches(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({
      cropName: '',
      quantityTotal: 0,
      unit: 'kg',
      pricePerUnit: 0,
      harvestDateEstimate: '',
      location: '',
      qualityStandard: '',
      minOrderQuantity: 1,
    });
    load();
  }

  async function postProgress(batchId: string, kind: 'on_track' | 'quantity_adjusted' | 'rescheduled') {
    const body =
      kind === 'quantity_adjusted'
        ? { kind, newQuantityTotal: progressQuantity }
        : kind === 'rescheduled'
          ? { kind, newHarvestDateEstimate: progressDate }
          : { kind };

    const res = await fetch(`/api/batches/${batchId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.message ?? error.code);
      return;
    }
    setProgressBatchId(null);
    load();
  }

  return (
    <AppShell role="farmer">
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Mùa vụ của tôi</h1>
          <p className={styles.subheading}>Đăng đợt thu hoạch sắp tới để người mua chủ động đặt trước.</p>
        </div>

        <Card>
          <h2 className={styles.sectionTitle}>Đăng mùa vụ</h2>
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
                <label htmlFor="pricePerUnit">Giá dự kiến / đơn vị</label>
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
                <input id="minOrderQuantity" type="number" min={1} value={form.minOrderQuantity} onChange={(e) => setForm({ ...form, minOrderQuantity: Number(e.target.value) })} />
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
              <Button type="submit">Xem trước và đăng</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className={styles.sectionTitle}>Mùa vụ đã đăng</h2>
          <div className={styles.batchList}>
            {batches.map((b) => {
              const status = batchStatusInfo(b.status);
              return (
                <div key={b.id} className={styles.batchRow}>
                  <div className={styles.batchInfo}>
                    <div className={styles.batchName}>{b.cropName}</div>
                    <div className={styles.batchMeta}>
                      Còn lại {b.quantityAvailable}/{b.quantityTotal} {b.unit} · {formatVnd(b.pricePerUnit)}/{b.unit}
                    </div>
                  </div>
                  <StatusBadge label={status.label} tone={status.tone} />
                  <div className={styles.batchActions}>
                    <Button
                      variant="outline"
                      onClick={async () => { await fetch(`/api/batches/${b.id}/ready`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'awaiting_harvest' }) }); load(); }}
                    >
                      Bắt đầu thu hoạch
                    </Button>
                    <Button
                      onClick={async () => { await fetch(`/api/batches/${b.id}/ready`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: 'ready_for_handover' }) }); load(); }}
                    >
                      Sẵn sàng giao
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setProgressBatchId(progressBatchId === b.id ? null : b.id)}
                    >
                      Cập nhật tiến độ
                    </Button>
                  </div>
                  {progressBatchId === b.id && (
                    <div className={styles.progressPanel}>
                      <Button variant="outline" onClick={() => postProgress(b.id, 'on_track')}>Đúng tiến độ</Button>
                      <div className={styles.field}>
                        <label htmlFor={`newQty-${b.id}`}>Điều chỉnh sản lượng</label>
                        <input
                          id={`newQty-${b.id}`}
                          type="number"
                          defaultValue={b.quantityTotal}
                          onChange={(e) => setProgressQuantity(Number(e.target.value))}
                        />
                        <Button variant="outline" onClick={() => postProgress(b.id, 'quantity_adjusted')}>Lưu sản lượng</Button>
                      </div>
                      <div className={styles.field}>
                        <label htmlFor={`newDate-${b.id}`}>Dời ngày thu hoạch</label>
                        <input
                          id={`newDate-${b.id}`}
                          type="date"
                          onChange={(e) => setProgressDate(e.target.value)}
                        />
                        <Button variant="outline" onClick={() => postProgress(b.id, 'rescheduled')}>Lưu ngày mới</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
