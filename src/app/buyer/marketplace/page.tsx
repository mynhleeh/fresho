'use client';
import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { MoneySummaryRow, formatVnd } from '../../components/MoneySummaryRow';
import { BookmarkIcon } from '../../components/icons';
import styles from './page.module.css';

type Batch = {
  id: string;
  cropName: string;
  quantityAvailable: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  qualityStandard: string | null;
  minOrderQuantity: number;
  harvestDateEstimate: string;
};
type VehicleType = 'motorbike' | 'small_truck' | 'refrigerated_truck';
type ShippingQuote = { estimatedFee: number; pickupWindow: string; storageRequirement: string; vehicleType: string };

const VEHICLE_LABEL: Record<VehicleType, string> = {
  motorbike: 'Xe máy',
  small_truck: 'Xe tải nhỏ',
  refrigerated_truck: 'Xe lạnh',
};

export default function Marketplace() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'self_pickup' | 'carrier'>('self_pickup');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorbike');
  const [distanceKm, setDistanceKm] = useState(10);
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'harvestDate' | 'trustScore'>('newest');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  async function load() {
    const params = new URLSearchParams();
    if (locationFilter) params.set('location', locationFilter);
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    const res = await fetch(`/api/batches?${params.toString()}`);
    if (!res.ok) return;
    setBatches(await res.json());
  }

  async function loadSaved() {
    const res = await fetch('/api/batches/saved');
    if (!res.ok) return;
    const saved: Batch[] = await res.json();
    setSavedIds(new Set(saved.map((b) => b.id)));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount; not the cascading-render pattern this rule targets
  useEffect(() => { load(); loadSaved(); }, [locationFilter, sortBy]);

  async function toggleSave(batchId: string) {
    const isSaved = savedIds.has(batchId);
    await fetch(`/api/batches/${batchId}/save`, { method: isSaved ? 'DELETE' : 'POST' });
    const next = new Set(savedIds);
    if (isSaved) next.delete(batchId); else next.add(batchId);
    setSavedIds(next);
  }

  async function requestQuote(batchId: string, quantity: number) {
    const res = await fetch('/api/shipping-quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, quantity, vehicleType, distanceKm }),
    });
    setQuote(res.ok ? await res.json() : null);
  }

  async function order(batchId: string) {
    const quantity = quantities[batchId] ?? 1;
    const res = await fetch('/api/preorders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchId,
        quantity,
        deliveryMethod,
        shippingFeeQuote: deliveryMethod === 'carrier' ? quote?.estimatedFee : undefined,
      }),
    });
    const preOrder = await res.json();
    if (res.ok) {
      const batch = batches.find((b) => b.id === batchId);
      if (!batch) {
        alert('Batch không còn tồn tại, vui lòng tải lại trang');
        load();
        return;
      }
      const depositRes = await fetch(`/api/preorders/${preOrder.id}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(quantity * batch.pricePerUnit * 0.2) }),
      });
      if (depositRes.ok) {
        alert('Đã đặt trước và thanh toán cọc');
      } else {
        const depositError = await depositRes.json();
        alert(`Đã đặt trước nhưng thanh toán cọc thất bại: ${depositError.message ?? depositError.code}`);
      }
      setSelectedId(null);
      setQuote(null);
      load();
    } else {
      alert(preOrder.message);
    }
  }

  const selectedBatch = batches.find((b) => b.id === selectedId) ?? null;
  const selectedQuantity = selectedBatch ? (quantities[selectedBatch.id] ?? 1) : 0;
  const goodsAmount = selectedBatch ? selectedQuantity * selectedBatch.pricePerUnit : 0;
  const depositAmount = Math.round(goodsAmount * 0.2);

  return (
    <AppShell role="buyer">
      <div className={styles.page}>
        <div>
          <h1 className={styles.heading}>Tìm nông sản</h1>
          <p className={styles.subheading}>Khám phá các lô hàng sắp thu hoạch.</p>
        </div>

        <div className={styles.quantityRow}>
          <label htmlFor="locationFilter">Khu vực</label>
          <input
            id="locationFilter"
            placeholder="Tiền Giang"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <label htmlFor="sortBy">Sắp xếp</label>
          <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <option value="newest">Mới nhất</option>
            <option value="harvestDate">Ngày thu hoạch gần nhất</option>
            <option value="trustScore">Uy tín người bán</option>
          </select>
        </div>

        <div className={styles.grid}>
          {batches.map((b) => (
            <Card key={b.id} className={`${styles.batchCard} ${selectedId === b.id ? styles.selected : ''}`}>
              <span className={styles.batchName}>{b.cropName}</span>
              <span className={styles.batchMeta}>Còn lại {b.quantityAvailable} {b.unit} · Tối thiểu {b.minOrderQuantity} {b.unit}</span>
              <span className={styles.batchMeta}>{b.location}</span>
              {b.qualityStandard && <span className={styles.batchMeta}>{b.qualityStandard}</span>}
              <span className={styles.price}>{formatVnd(b.pricePerUnit)}/{b.unit}</span>
              <Button variant={selectedId === b.id ? 'primary' : 'outline'} onClick={() => setSelectedId(b.id)}>
                Xem lô hàng
              </Button>
              <Button variant="outline" onClick={() => toggleSave(b.id)}>
                <BookmarkIcon className={styles.bookmarkIcon} />
                {savedIds.has(b.id) ? 'Đã lưu' : 'Lưu lô'}
              </Button>
            </Card>
          ))}
        </div>

        {selectedBatch && (
          <Card className={styles.orderPanel}>
            <span className={styles.orderPanelTitle}>Đặt trước lô hàng — {selectedBatch.cropName}</span>
            <div className={styles.quantityRow}>
              <label htmlFor="quantity">Số lượng đặt trước</label>
              <input
                id="quantity"
                type="number"
                min={selectedBatch.minOrderQuantity}
                max={selectedBatch.quantityAvailable}
                defaultValue={selectedBatch.minOrderQuantity}
                onChange={(e) => setQuantities({ ...quantities, [selectedBatch.id]: Number(e.target.value) })}
              />
              <span>{selectedBatch.unit}</span>
            </div>
            <MoneySummaryRow label="Tiền hàng" value={formatVnd(goodsAmount)} />

            <div className={styles.quantityRow}>
              <label htmlFor="deliveryMethod">Phương thức nhận hàng</label>
              <select
                id="deliveryMethod"
                value={deliveryMethod}
                onChange={(e) => { setDeliveryMethod(e.target.value as 'self_pickup' | 'carrier'); setQuote(null); }}
              >
                <option value="self_pickup">Tự đến lấy</option>
                <option value="carrier">Đặt vận chuyển</option>
              </select>
            </div>

            {deliveryMethod === 'carrier' && (
              <>
                <div className={styles.quantityRow}>
                  <label htmlFor="vehicleType">Loại xe</label>
                  <select id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
                    {(Object.keys(VEHICLE_LABEL) as VehicleType[]).map((v) => (
                      <option key={v} value={v}>{VEHICLE_LABEL[v]}</option>
                    ))}
                  </select>
                  <label htmlFor="distanceKm">Khoảng cách (km)</label>
                  <input
                    id="distanceKm"
                    type="number"
                    min={1}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                  />
                  <Button variant="outline" onClick={() => requestQuote(selectedBatch.id, selectedQuantity)}>
                    Xem báo cước
                  </Button>
                </div>
                {quote && (
                  <>
                    <MoneySummaryRow label="Cước vận chuyển dự kiến" value={formatVnd(quote.estimatedFee)} />
                    <div className={styles.batchMeta}>Thời gian lấy hàng: {quote.pickupWindow}</div>
                    <div className={styles.batchMeta}>Yêu cầu bảo quản: {quote.storageRequirement}</div>
                  </>
                )}
              </>
            )}

            <div className={styles.depositCallout}>
              <div className={styles.depositCalloutLabel}>Đặt cọc hôm nay (20%)</div>
              <div className={styles.depositCalloutValue}>{formatVnd(depositAmount)}</div>
            </div>
            <Button onClick={() => order(selectedBatch.id)}>Xác nhận và đặt cọc</Button>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
