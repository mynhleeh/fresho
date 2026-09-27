'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { formatVnd } from '../../components/MoneySummaryRow';
import { batchStatusInfo } from '@/lib/orderStatus';
import styles from './page.module.css';

type Batch = { id: string; cropName: string; quantityTotal: number; quantityAvailable: number; unit: string; pricePerUnit: number; status: string };

export default function FarmerBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [form, setForm] = useState({ cropName: '', quantityTotal: 0, unit: 'kg', pricePerUnit: 0, harvestDateEstimate: '' });

  async function load() {
    const res = await fetch('/api/batches');
    setBatches(await res.json());
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ cropName: '', quantityTotal: 0, unit: 'kg', pricePerUnit: 0, harvestDateEstimate: '' });
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
            </div>

            {/* TODO(business-confirm): gợi ý giá/đóng gói từ AI chưa có mô hình thật, hiển thị tĩnh theo mockup để minh hoạ UX */}
            <div className={styles.aiHint}>
              <div className={styles.aiHintTitle}>✨ Gợi ý từ AI (chỉ mang tính tham khảo)</div>
              <div>Giá tham khảo cho nông sản cùng loại trong khu vực thường dao động quanh mức đã đăng gần đây. Nông dân vẫn là người quyết định giá bán cuối cùng.</div>
            </div>

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
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
