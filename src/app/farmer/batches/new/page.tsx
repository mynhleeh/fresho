'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/AppShell';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { formatVnd } from '../../../components/MoneySummaryRow';
import { SparkleIcon } from '../../../components/icons';
import styles from './page.module.css';

export default function NewHarvestBatch() {
  const router = useRouter();
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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

    router.push('/farmer/batches');
  }

  return (
    <AppShell role="farmer">
      <div className={styles.page}>
        <h1 className={styles.heading}>Đăng mùa vụ mới</h1>
        <Card>
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
              <div className={styles.field}>
                <label htmlFor="photo">Ảnh mùa vụ (không bắt buộc)</label>
                <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
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
      </div>
    </AppShell>
  );
}
